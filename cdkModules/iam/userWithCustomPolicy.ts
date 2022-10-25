import { Effect, Policy, PolicyStatement, User } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

type Props = {
  region: string;
  awsPartition: string;
  awsAccountId: string;
  apiPath: string;
};

export class IamUserWithCustomPolicy extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const apiAccess = new Policy(this, `${id}-api-access-policy`, {
      policyName: `${id}-api-access-policy`,
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["execute-api:Invoke"],
          resources: [`arn:${props.awsPartition}:execute-api:${props.region}:${props.awsAccountId}:${props.apiPath}`],
        }),
      ],
    });

    const user = new User(this, `${id}-user`, {
      userName: `${id}-user`,
    });
    user.attachInlinePolicy(apiAccess);
  }
}
