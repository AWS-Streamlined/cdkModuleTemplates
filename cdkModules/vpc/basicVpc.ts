import { CfnOutput } from "aws-cdk-lib";
import { IVpc, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class BasicVpc extends Construct {
  vpc: IVpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new Vpc(this, `${id}-vpc`, {
      vpcName: `${id}-vpc`,
      cidr: "10.0.0.0/24",
      maxAzs: 4,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 28,
          name: "public",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 27,
          name: "application",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    new CfnOutput(this, "VpcId", {
      value: this.vpc.vpcId,
    });
  }
}
