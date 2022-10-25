# <mark>Your Application's Name</mark> Infrastructure

This repository contains an AWS CDK application, <mark>which will create... add specifics about the applications here</mark>.

Here's an overview of infrastructure that is managed by this application:
![Infrastructure](./docs/diagrams/your_diagram.png)

Important things to note:

- <mark>Add important things to note here</mark>

## Stacks Included

<mark>If you are using a dual stack deployment (bootstrap -> manual configurations -> main infra), modify this section to your liking</mark>

The application contains two stacks, a bootstrap stack and a stack that will deploy the majority of the infrastructure. A stack maps directly to a CloudFormation Stack in AWS.

- Bootstrap: <mark>bootstrap_stack_name</mark>
- Main Infrastructure: <mark>main_infra_stack_name</mark>

The bootstrap stack will create resources that will need to be modified manually, and that are required by other resources in the infrastructure stack.

## Runbooks

Routine tasks with defined steps are detailed in the `./docs/runbooks` directory. Notable runbooks include:

- <mark>Add runbooks included in your repository</mark>
