import * as cdk from 'aws-cdk-lib/core';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import path from "node:path";

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

    const startGameLambda = new NodejsFunction(this, 'StartGameFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/startGame.ts"),
      handler: 'handler',
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const makeGuessLambda = new NodejsFunction(this, 'MakeGuessFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/makeGuess.ts"),
      handler: 'handler',
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    dbTable.grantReadWriteData(startGameLambda);
    dbTable.grantReadWriteData(makeGuessLambda);

    const api = new apigateway.RestApi(this, 'GuessTheNumberApi', {
      restApiName: 'Guess The Number Service',
    });
    
    api.root.addResource('start-game').addMethod('POST', new apigateway.LambdaIntegration(startGameLambda));
    api.root.addResource('make-guess').addMethod('POST', new apigateway.LambdaIntegration(makeGuessLambda));
  }
}
