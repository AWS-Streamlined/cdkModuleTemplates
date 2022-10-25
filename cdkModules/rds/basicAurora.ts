import { IVpc, SubnetType, InstanceType, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { DatabaseCluster, DatabaseClusterEngine, AuroraMysqlEngineVersion, Credentials } from "aws-cdk-lib/aws-rds";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

type Props = {
  vpc: IVpc;
  instanceType: InstanceType;
  securityGroup: SecurityGroup;
  dbMasterPasswordSecret: ISecret;
};

export class BasicAurora extends Construct {
  databaseCluster: DatabaseCluster;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.databaseCluster = new DatabaseCluster(this, id, {
      clusterIdentifier: id,
      engine: DatabaseClusterEngine.auroraMysql({ version: AuroraMysqlEngineVersion.VER_2_07_2 }),
      credentials: Credentials.fromSecret(props.dbMasterPasswordSecret),
      instances: 2,
      instanceProps: {
        instanceType: props.instanceType,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        vpc: props.vpc,
        securityGroups: [props.securityGroup],
        enablePerformanceInsights: true,
      },
      storageEncrypted: true,
    });
  }
}
