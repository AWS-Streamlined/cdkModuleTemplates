import { Duration } from "aws-cdk-lib";
import { Function } from "aws-cdk-lib/aws-lambda";
import { JsonPath, StateMachine, TaskInput } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

type Props = {
  firstLambdaFunction: Function;
  secondLambdaFunction: Function;
  errorLambdaFunction: Function;
};

export class BasicStateMachineWithCatchAndRetries extends Construct {
  stateMachine: StateMachine;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const firstTask = new LambdaInvoke(this, `${id}-first-task`, {
      lambdaFunction: props.firstLambdaFunction,
      payload: TaskInput.fromJsonPathAt("$"),
      resultPath: "$.firstTaskPayload",
    });

    const secondTask = new LambdaInvoke(this, `${id}-second-task`, {
      lambdaFunction: props.secondLambdaFunction,
      payload: TaskInput.fromObject({
        inputId: JsonPath.stringAt("$.inputId"),
        firstTaskResult: JsonPath.stringAt("$.imageGenerationPayload.Payload.body.imageKey"),
      }),
    });

    const errorTask = new LambdaInvoke(this, `${id}-error-task`, {
      lambdaFunction: props.secondLambdaFunction,
      payload: TaskInput.fromObject({
        inputId: JsonPath.stringAt("$.inputId"),
        error: JsonPath.stringAt("$.error"),
      }),
    });

    const definition = firstTask
      .addRetry({
        errors: ["CustomError"],
        interval: Duration.seconds(2),
        maxAttempts: 3,
        backoffRate: 2,
      })
      .addCatch(errorTask, {
        resultPath: "$.error",
      })
      .next(secondTask);

    this.stateMachine = new StateMachine(this, id, {
      stateMachineName: id,
      definition,
      timeout: Duration.minutes(1),
    });
  }
}
