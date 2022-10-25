import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { CfnKeyPair, InstanceType, IVpc, LaunchTemplate, MachineImage, Peer, Port, SecurityGroup, SubnetType, UserData } from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

type Props = {
  vpc: IVpc;
  instanceType: InstanceType;
  bastionHostIp: string;
};

export class WorkerGroupWithLoadBalancer extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const workerRole = new Role(this, `${id}-role`, {
      roleName: `${id}-role`,
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy")],
    });

    const ec2Sg = new SecurityGroup(this, `${id}-ec2-sg`, {
      securityGroupName: `${id}-ec2-sg`,
      vpc: props.vpc,
    });
    ec2Sg.addIngressRule(Peer.ipv4(`${props.bastionHostIp}/32`), Port.tcp(22), "Allow ssh access from bastion host");

    const workerKeyPair = new CfnKeyPair(this, `${id}-keypair`, {
      keyName: `${id}-keypair`,
    });

    const userData = UserData.forLinux();
    userData.addCommands(
      `sleep 30s`, // TODO update or remove
    );

    const launchTemplate = new LaunchTemplate(this, `${id}-lt`, {
      launchTemplateName: `${id}-lt`,
      machineImage: MachineImage.genericLinux({
        "us-east-1": "ami-1234", // TODO change for your desired AMI
        "us-west-1": "ami-5678", // TODO change for your desired AMI
      }),
      instanceType: props.instanceType,
      securityGroup: ec2Sg,
      role: workerRole,
      keyName: workerKeyPair.keyName,
      userData,
    });

    const asg = new AutoScalingGroup(this, `${id}-asg`, {
      autoScalingGroupName: `${id}-asg`,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      launchTemplate: launchTemplate,
      minCapacity: 0,
      desiredCapacity: 1,
      maxCapacity: 4,
    });

    const lbSg = new SecurityGroup(this, `${id}-lb-sg`, {
      securityGroupName: `${id}-lb-sg`,
      vpc: props.vpc,
    });

    /* Private Load Balancer
     * The worker group will only be accessible from within the VPC
     * Remove this line if you want your worker group to be public */
    lbSg.addIngressRule(Peer.ipv4(props.vpc.vpcCidrBlock), Port.tcp(80), "Allow HTTP access from within the VPC");
    /* Public Load Balancer
     * The worker group will be accessible from anywhere, including the public internet
     * Uncomment this line if you want your worker group to be public */
    // lbSg.addIngressRule(Peer.anyIpv4(), Port.tcp(80), "Allow HTTP access from anywhere");

    const lb = new ApplicationLoadBalancer(this, `${id}-lb`, {
      loadBalancerName: `${id}-lb`,
      vpc: props.vpc,
      internetFacing: false,
      securityGroup: lbSg,
    });

    const listener = lb.addListener(`${id}-http-listener`, {
      port: 80,
      open: false,
    });

    listener.addTargets(`${id}-http-listener-targets`, {
      port: 80,
      targets: [asg],
    });

    ec2Sg.addIngressRule(Peer.securityGroupId(lbSg.securityGroupId), Port.tcp(80), "Allow HTTP access from the Load Balancer");
  }
}
