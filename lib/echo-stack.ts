import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");

export class EchoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const echoHandler = new lambda.Function(this, "EchoHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset("echo-handler"),
      handler: "main.handler"
    });
    new apigw.LambdaRestApi(this, "EchoApi", {
      handler: echoHandler
    });
  }
}
