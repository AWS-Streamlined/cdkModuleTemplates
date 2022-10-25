import { SecretValue } from "aws-cdk-lib";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

type Props = {};

/**
 * This construct will typically be used when migrating existing environments to new AWS regions
 * or as part of a disaster recovery strategy.
 *
 * You would define secrets that hold temporary values in a bootstrap stack, and reference them
 * in a different stack, where the resources that need them will be defined.
 *
 * Then, you would have a 3 step deployment process
 * 1. Deploy the bootstrap stack
 * 2. Modify the secrets to their actual values using the AWS console
 * 3. Deploy the infrastructure stack
 */
export class TemporaryPassword extends Construct {
  yourSecret: ISecret;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.yourSecret = new Secret(this, id, {
      secretName: id,
      secretObjectValue: {
        Username: SecretValue.unsafePlainText("wrongUsername"),
        Password: SecretValue.unsafePlainText("wrongPassword"),
      },
    });
  }
}
