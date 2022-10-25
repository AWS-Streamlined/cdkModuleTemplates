It can sometimes be confusing to find the right EC2 secret key when it has been created by CDK. The private keys are stored in AWS Systems Manager Parameter Store. Follow this runbook to identify the Systems Manager Parameter associated with a EC2 secret.

1. In EC2 console, select the EC2 instance to which you want to connect
2. Under the _Details_ tab, find the _Key pair name_, and click on the link
3. Memorise the _ID_ of the key pair. It should look something like `key-076b132fe03119dcb`
4. Navigate to the Systems Manager console, and go to the Parameter Store section
5. Find the parameter that ends with the key ID, `/ec2/keypair/${key_id}`
6. Decrypt the value (using the _Show_ button), and store the key securly on your computer
