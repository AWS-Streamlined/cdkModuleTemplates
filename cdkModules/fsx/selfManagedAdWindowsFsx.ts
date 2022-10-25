import { CfnOutput, Tags } from "aws-cdk-lib";
import { ISecurityGroup, ISubnet } from "aws-cdk-lib/aws-ec2";
import { CfnFileSystem } from "aws-cdk-lib/aws-fsx";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

type Props = {
  subnetIds: ISubnet[];
  securityGroup: ISecurityGroup;
  fsxSecret: ISecret;
  dnsServerIps: string[];
};

export class SelfManagedAdWindowsFsx extends Construct {
  fileSystem: CfnFileSystem;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.fileSystem = new CfnFileSystem(this, id, {
      fileSystemType: "WINDOWS",
      subnetIds: props.subnetIds.map((sub) => sub.subnetId),
      securityGroupIds: [props.securityGroup.securityGroupId],
      storageCapacity: 32,
      storageType: "SSD",
      windowsConfiguration: {
        deploymentType: "MULTI_AZ_1",
        preferredSubnetId: props.subnetIds[0].subnetId,
        throughputCapacity: 32,
        selfManagedActiveDirectoryConfiguration: {
          /* Make sure that the Active Directory has all the prerequisites
           * and that the user provided has the required permissions.
           * Refer to https://docs.aws.amazon.com/fsx/latest/WindowsGuide/self-manage-prereqs.html */
          domainName: "example.com",
          dnsIps: props.dnsServerIps,
          /* This is the safest way to pass in credentials for the FSx user.
           * The credentials will *never* appear in plaintext with that method */
          userName: props.fsxSecret.secretValueFromJson("username").unsafeUnwrap(),
          password: props.fsxSecret.secretValueFromJson("password").unsafeUnwrap(),
        },
      },
    });

    Tags.of(this.fileSystem).add("Name", id);

    new CfnOutput(this, "FsxDnsName", {
      value: this.fileSystem.attrDnsName,
    });
  }
}
