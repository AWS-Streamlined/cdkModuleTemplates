import { CfnOutput, Tags } from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

type Props = {};

export class BucketWithCloudFrontDistribution extends Construct {
  bucket: Bucket;
  distribution: Distribution;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.bucket = new Bucket(scope, `${id}-bucket`, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      //removalPolicy: RemovalPolicy.RETAIN, could be interesting, but disable for now
    });

    Tags.of(this.bucket).add("Name", id);

    this.distribution = new Distribution(this, `${id}-cf-distribution`, {
      defaultBehavior: {
        origin: new S3Origin(this.bucket),
      },
    });

    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        effect: Effect.ALLOW,
        actions: ["s3:GetObject"],
        resources: [`${this.bucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": this.distribution.distributionId,
          },
        },
      }),
    );

    new CfnOutput(this, "DistributionEndpoint", {
      value: this.distribution.domainName,
    });
  }
}
