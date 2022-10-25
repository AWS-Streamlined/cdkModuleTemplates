import { Duration } from "aws-cdk-lib";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type Props = {
  region: string;
};

export class BasicNodeJsLambdaFunction extends Construct {
  lambdaFunction: Function;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.lambdaFunction = new NodejsFunction(this, id, {
      functionName: id,
      entry: "./path/to/handler.ts",
      handler: "main",
      environment: {
        REGION: props.region,
      },
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["aws:action"],
          resources: ["aws:resource"],
        }),
      ],
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_16_X,
    });
  }
}
