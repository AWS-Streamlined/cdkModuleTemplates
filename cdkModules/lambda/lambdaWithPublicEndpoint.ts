import { CfnOutput, Duration } from "aws-cdk-lib";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { Function, FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type Props = {
  region: string;
};

export class BasicNodeJsLambdaFunction extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const dummyLambda = new NodejsFunction(this, id, {
      functionName: id,
      entry: "./path/to/handler.ts",
      handler: "main",
      environment: {
        REGION: props.region,
      },
      runtime: Runtime.NODEJS_16_X,
    });

    const fnUrl = dummyLambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "TheUrl", {
      value: fnUrl.url,
    });
  }
}
