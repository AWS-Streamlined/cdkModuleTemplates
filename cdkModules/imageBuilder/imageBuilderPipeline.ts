import { CfnOutput } from "aws-cdk-lib";
import {
  CfnComponent,
  CfnDistributionConfiguration,
  CfnImagePipeline,
  CfnImageRecipe,
  CfnInfrastructureConfiguration,
} from "aws-cdk-lib/aws-imagebuilder";
import { Construct } from "constructs";

type Props = {
  customComponent: CfnComponent;
};

export class ImageBuilderPipeline extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const amiRecipe = new CfnImageRecipe(this, "ami-recipe", {
      name: "ami-recipe",
      description: "YOUR DESCRIPTION",
      version: "1.0.0",
      parentImage: "ami-12345", // TODO change for your desired parent AMI
      components: [
        /* Change this component list to your match your needs
         * The example demonstrates using a component managed by AWS and
         * a custom component built in the same stack */
        {
          componentArn: "arn:aws:imagebuilder:us-east-1:aws:component/aws-cli-version-2-linux/1.0.3/1",
        },
        {
          componentArn: props.customComponent.attrArn,
        },
      ],
    });

    const amiPipelineInfra = new CfnInfrastructureConfiguration(this, "ami-pipeline-infra", {
      name: "ami-pipeline-infra",
      instanceProfileName: "EC2InstanceProfileForImageBuilder",
      instanceTypes: ["t3.medium"], // TODO potentially change this for something beefier or with specific needs such as a GPU
    });

    const amiPipelineDistribution = new CfnDistributionConfiguration(this, "ami-pipeline-dist", {
      name: "ami-pipeline-dist",
      distributions: [
        /* Change this account/region list to your match your needs
         * The example demonstrates distributing the AMI to two regions
         * within the same AWS account */
        {
          amiDistributionConfiguration: {
            TargetAccountIds: ["1234567890"], // TODO change to your account number
          },
          region: "us-east-1",
        },
        {
          amiDistributionConfiguration: {
            TargetAccountIds: ["1234567890"], // TODO change to your account number
          },
          region: "us-west-1",
        },
      ],
    });

    const amiPipeline = new CfnImagePipeline(this, "ami-pipeline", {
      name: "ami-pipeline",
      imageRecipeArn: amiRecipe.attrArn,
      infrastructureConfigurationArn: amiPipelineInfra.attrArn,
      distributionConfigurationArn: amiPipelineDistribution.attrArn,
    });

    new CfnOutput(this, "ami-pipeline-output", {
      value: amiPipeline.attrArn,
    });
  }
}
