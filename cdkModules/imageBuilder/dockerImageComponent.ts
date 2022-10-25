import { CfnComponent } from "aws-cdk-lib/aws-imagebuilder";
import { Construct } from "constructs";

export class DockerImageComponent extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const dockerImageComponent = new CfnComponent(this, "docker-image", {
      name: "docker-image",
      description: "This component will login to ECR, pull the latest <your_image> docker image, and run a container with it",
      version: "1.0.0",
      platform: "Linux",
      supportedOsVersions: ["Ubuntu 20"],
      data: `
name: InstallDockerImage
schemaVersion: 1.0
phases:
  - name: build
    steps:
      - name: EcsLogin
        action: ExecuteBash
        inputs:
          commands:
            - |
              aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ecr_endpoint>
      - name: PullImage
        action: ExecuteBash
        inputs:
          commands:
            - |
              docker pull <ecr_endpoint>/<repository_name>:<image_tag>
      - name: CreateContainer
        action: ExecuteBash
        inputs:
          commands:
            - |
              docker run -p 80:80 --name <your_image_name> --restart unless-stopped -d <ecr_endpoint>/<repository_name>:<image_tag>
      - name: WaitForContainer
        action: ExecuteBash
        inputs:
          commands:
            - |
              sleep 120s
      - name: TestContainer
        action: ExecuteBash
        timeoutSeconds: 300
        maxAttempts: 60
        inputs:
          commands:
            - |
              curl -X POST -H 'Content-Type: application/json' -d '{"test": "request"}' -sS http://0.0.0.0/
`,
    });
  }
}
