import * as cdk from 'aws-cdk-lib/core';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path from 'node:path';

const LAMBDA_DIR = path.join(__dirname, '../lambda');

export class GuessTheNumberStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const GAME_TABLE_NAME = 'GameTable';

    const dbTable = new dynamodb.Table(this, GAME_TABLE_NAME, {
      tableName: GAME_TABLE_NAME,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaProps = (filename: string): NodejsFunctionProps => ({
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(LAMBDA_DIR, filename),
      handler: 'handler',
      environment: {
        TABLE_NAME: dbTable.tableName
      },
    });

    const startGameLambda = new NodejsFunction(this, 'StartGameFunction', lambdaProps('startGame.ts'));
    const makeGuessLambda = new NodejsFunction(this, 'MakeGuessFunction', lambdaProps('makeGuess.ts'));

    dbTable.grantReadWriteData(startGameLambda);
    dbTable.grantReadWriteData(makeGuessLambda);

    const api = new apigateway.RestApi(this, 'GuessTheNumberApi', {
      restApiName: 'Guess The Number Service',
    });
    
    api.root.addResource('start-game').addMethod('POST', new apigateway.LambdaIntegration(startGameLambda));
    api.root.addResource('make-guess').addMethod('POST', new apigateway.LambdaIntegration(makeGuessLambda));
  }
}
