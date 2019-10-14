import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");
import dynamodb = require("@aws-cdk/aws-dynamodb");

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orders = new dynamodb.Table(this, "Orders", {
      partitionKey: {
        name: "OrderId",
        type: dynamodb.AttributeType.STRING
      }
    });
    const orderResourceHandler = new lambda.Function(this, "OrderResourceHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset("order-resource-handler"),
      handler: "main.handler",
      environment: {
        TABLE_NAME: orders.tableName
      }
    });
    orders.grantReadWriteData(orderResourceHandler);
    new apigw.LambdaRestApi(this, "OrderApi", {
      handler: orderResourceHandler
    });
  }
}
