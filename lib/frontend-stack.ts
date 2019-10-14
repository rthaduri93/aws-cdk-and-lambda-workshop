import cdk = require("@aws-cdk/core");
import s3 = require("@aws-cdk/aws-s3");
import s3Deploy = require("@aws-cdk/aws-s3-deployment");

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "WebUI", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true
    });
    new s3Deploy.BucketDeployment(this, "WebUIDeployment", {
      source: s3Deploy.Source.asset("webui"),
      destinationBucket: bucket
    });
  }
}
