import { CfnOutput } from "aws-cdk-lib";
import {
  RestApi,
  Model,
  AuthorizationType,
  Resource,
  Cors,
  ResponseType,
  JsonSchemaVersion,
  JsonSchemaType,
  RequestValidator,
  LambdaIntegration,
} from "aws-cdk-lib/aws-apigateway";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

type Props = {
  firstResourceLambda: Function;
};

export class ApiGatewayWithCorsAndModel extends Construct {
  api: RestApi;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

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

    const firstResource = new Resource(this, `${id}-first`, {
      parent: this.api.root,
      pathPart: "first",
    });

    firstResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: Cors.ALL_METHODS,
      allowCredentials: true,
    });

    firstResource.addMethod("POST", new LambdaIntegration(props.firstResourceLambda), {
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
    });
  }
}
