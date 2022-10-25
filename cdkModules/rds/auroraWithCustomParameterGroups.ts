import { IVpc, SubnetType, InstanceType, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { DatabaseCluster, DatabaseClusterEngine, AuroraMysqlEngineVersion, Credentials, ParameterGroup } from "aws-cdk-lib/aws-rds";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

type Props = {
  vpc: IVpc;
  instanceType: InstanceType;
  securityGroup: SecurityGroup;
  dbMasterPasswordSecret: ISecret;
};

export class AuroraWithCustomParameterGroups extends Construct {
  databaseCluster: DatabaseCluster;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    // TODO change this to your prefered engine
    const dbEngine = DatabaseClusterEngine.auroraMysql({ version: AuroraMysqlEngineVersion.VER_2_07_2 });

    this.databaseCluster = new DatabaseCluster(this, id, {
      clusterIdentifier: id,
      engine: dbEngine,
      credentials: Credentials.fromSecret(props.dbMasterPasswordSecret),
      instances: 2,
      instanceProps: {
        instanceType: props.instanceType,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        vpc: props.vpc,
        securityGroups: [props.securityGroup],
        parameterGroup: new ParameterGroup(this, `${id}-instanceparameters`, {
          engine: dbEngine,
          description: `Custom instance parameter group for ${id}`,
          parameters: {
            /* Change this to include any custom parameters
             * that you need to configure */
            event_scheduler: "ON",
            net_read_timeout: "28800",
            net_write_timeout: "28800",
          },
        }),
        enablePerformanceInsights: true,
      },
      storageEncrypted: true,
      parameterGroup: new ParameterGroup(this, `${id}-clusterparameters`, {
        engine: dbEngine,
        description: `Custom cluster parameter group for ${id}`,
        parameters: {
          /* Change this to include any custom parameters
           * that you need to configure */
          character_set_server: "utf8",
          collation_server: "utf8_general_ci",
        },
      }),
    });
  }
}
