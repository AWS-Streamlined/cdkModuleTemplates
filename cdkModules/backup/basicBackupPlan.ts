import { BackupPlan, BackupPlanRule, BackupResource, BackupVault } from "aws-cdk-lib/aws-backup";
import { DatabaseCluster } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

type Props = {
  dbClustersToBackup: DatabaseCluster[];
};

export class BasicBackupPlan extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const vault = new BackupVault(this, `${id}-vault`, {
      backupVaultName: `${id}-vault`,
    });

    const plan = new BackupPlan(this, `${id}-backup-plan`, {
      backupPlanName: `${id}-backup-plan`,
      backupVault: vault,
      backupPlanRules: [BackupPlanRule.daily(), BackupPlanRule.monthly1Year()],
    });

    plan.addSelection(`${id}-selections`, {
      resources: props.dbClustersToBackup.map(BackupResource.fromRdsDatabaseCluster),
    });
  }
}
