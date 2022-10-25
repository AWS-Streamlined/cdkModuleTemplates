import {
  RestApi,
  AwsIntegration,
  PassthroughBehavior,
  Model,
  AuthorizationType,
  Resource,
  Cors,
  ResponseType,
  JsonSchemaVersion,
  JsonSchemaType,
  RequestValidator,
} from "aws-cdk-lib/aws-apigateway";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

type Props = {
  stateMachine: StateMachine;
};

export class ApiWithStandardStateMachineIntegration extends Construct {
  api: RestApi;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const iamRole = new Role(this, `${id}-role`, {
      roleName: `${id}-role`,
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        firstResourceSfn: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["states:StartExecution"],
              resources: [props.stateMachine.stateMachineArn],
            }),
          ],
        }),
      },
    });

    this.api = new RestApi(this, id, {
      restApiName: id,
    });

    this.api.addGatewayResponse("client-error", {
      type: ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Credentials": "'true'",
      },
    });

    this.api.addGatewayResponse("server-error", {
      type: ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Credentials": "'true'",
      },
    });

    const firstResource = new Resource(this, `${id}-firstResource`, {
      parent: this.api.root,
      pathPart: "firstResource",
    });

    firstResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: Cors.ALL_METHODS,
      allowCredentials: true,
    });

    firstResource.addMethod(
      "POST",
      new AwsIntegration({
        service: "states",
        action: "StartExecution",
        options: {
          credentialsRole: iamRole,
          integrationResponses: [
            {
              statusCode: "200",
              responseParameters: {
                "method.response.header.Access-Control-Allow-Headers":
                  "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                "method.response.header.Access-Control-Allow-Origin": "'*'",
                "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST'",
                "method.response.header.Access-Control-Allow-Credentials": "'true'",
              },
            },
          ],
          passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
          requestTemplates: {
            "application/json": `
{
  "input": " $util.escapeJavaScript($input.body).replaceAll("\\'","'")",
  "stateMachineArn": "${props.stateMachine.stateMachineArn}"
}
          `,
          },
        },
      }),
      {
        requestValidator: new RequestValidator(this, `${id}-firstResource-validator`, {
          restApi: this.api,
          requestValidatorName: `${id}-firstResource-validator`,
          validateRequestBody: true,
        }),
        requestModels: {
          "application/json": new Model(this, `${id}-firstResource-model`, {
            restApi: this.api,
            contentType: "application/json",
            modelName: "firstResource",
            schema: {
              schema: JsonSchemaVersion.DRAFT4,
              title: "firstResource",
              type: JsonSchemaType.OBJECT,
              properties: {
                inputId: { type: JsonSchemaType.STRING },
                message: { type: JsonSchemaType.STRING },
              },
              required: ["inputId", "message"],
            },
          }),
        },
        authorizationType: AuthorizationType.IAM,
        methodResponses: [
          {
            statusCode: "200",
            responseModels: {
              "application/json": Model.EMPTY_MODEL,
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
            },
          },
        ],
      },
    );
  }
}
