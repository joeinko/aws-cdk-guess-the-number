# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Improvements

* Add input sanitization in the POST request input body params
* Input validation (for the id specifically)
* Add authorization header using API key or user token
* Add throttling to prevent API spam
* Give minimal privileges to the IAM User/Role used by the Lambda function
* Clean stale games with ttl param
* Configure billing accordingly for production depending on expected usage