import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

type Props = {
  vpc: IVpc;
  someIpv4Address: string;
  anotherSecurityGroup: ISecurityGroup;
};

export class BasicSecurityGroup extends Construct {
  securityGroup: ISecurityGroup;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.securityGroup = new SecurityGroup(this, id, {
      securityGroupName: id,
      vpc: props.vpc,
    });

    this.securityGroup.addIngressRule(Peer.ipv4(`${props.someIpv4Address}/32`), Port.tcp(22), "Allow SSH access for a specific IP address");

    this.securityGroup.addIngressRule(
      Peer.securityGroupId(props.anotherSecurityGroup.securityGroupId),
      Port.tcp(8080),
      "Allow access from another security group",
    );
  }
}
