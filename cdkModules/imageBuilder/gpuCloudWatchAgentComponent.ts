import { CfnComponent } from "aws-cdk-lib/aws-imagebuilder";
import { Construct } from "constructs";

export class DockerImageComponent extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const gpuMetrics = new CfnComponent(this, "gpu-metrics", {
      name: "gpu-metrics",
      description: "This component will create a file for the CloudWatch agent to collect GPU metrics",
      version: "1.0.0",
      platform: "Linux",
      supportedOsVersions: ["Ubuntu 20"],
      data: `
name: GpuMetrics
schemaVersion: 1.0
phases:
  - name: build
    steps:
      - name: WriteConfigFile
        action: ExecuteBash
        inputs:
          commands:
            - |
              sudo tee -a /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<EOF
              {
                "agent": {
                  "run_as_user": "root"
                },
                "metrics": {
                  "append_dimensions": {
                    "AutoScalingGroupName": "\\\${aws:AutoScalingGroupName}",
                    "ImageId": "\\\${aws:ImageId}",
                    "InstanceId": "\\\${aws:InstanceId}",
                    "InstanceType": "\\\${aws:InstanceType}"
                  },
                  "aggregation_dimensions": [["InstanceId"]],
                  "metrics_collected": {
                    "nvidia_gpu": {
                      "measurement": [
                        "utilization_gpu",
                        "utilization_memory",
                        "memory_total",
                        "memory_used",
                        "memory_free",
                        "clocks_current_graphics",
                        "clocks_current_sm",
                        "clocks_current_memory"
                      ]
                    },
                    "mem": {
                      "measurement": [
                        "used",
                        "free",
                        "total",
                        "used_percent"
                      ]
                    }
                  }
                },
                "logs": {
                  "logs_collected": {
                    "files": {
                      "collect_list": [
                        {
                          "file_path": "/var/log/gpuevent.log",
                          "log_group_name": "/ec2/accelerated/accel-event-log",
                          "log_stream_name": "{instance_id}"
                        }
                      ]
                    }
                  }
                }
              }
              EOF
      - name: LoadNewConfig
        action: ExecuteBash
        inputs:
          commands:
            - |
              sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
`,
    });
  }
}
