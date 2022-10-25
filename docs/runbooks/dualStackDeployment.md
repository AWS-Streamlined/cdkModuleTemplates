This runbook will guide you through creating the infrastructure, i.e. deploying a stack, managed inside this repository. This can be used when setting up a new environment without any initial data, or when updating the infrastructure for a stack that already exists. _This runbook is not intended to migrate an existing environment to a new account_, such as what would be required for a disaster recovery.

This runbook assumes that you already have your AWS credentials properly configured to interact with the aws-cli and AWS APIs. It also assumes that you have properly installed all dependencies for the application (typically done running `npm install` at the root of the repository).

The CDK application in this repository is account and region agnostic, meaning it can be used to deploy to any account or region.

1. If this is the first time using AWS CDK in this account/region combination, bootstrap the framework using: `CDK_DEPLOY_STAGE=<stage> CDK_DEPLOY_REGION=<aws_region> npx cdk bootstrap aws://<aws_account_id>/<aws_region>`
2. Deploy the bootstrap stack: `CDK_DEPLOY_STAGE=<stage> CDK_DEPLOY_REGION=<aws_region> npx cdk deploy <bootstrap_stack_name>`
3. Manually update all the resources that need specific values set:
   a. ==First resource that needs manual intervention==
   b. ==Second resource that needs manual intervention==
4. Deploy the infra stack: `CDK_DEPLOY_STAGE=<stage> CDK_DEPLOY_REGION=<aws_region> npx cdk deploy <infra_stack_name>`
5. Verify that all the environment has been created properly
