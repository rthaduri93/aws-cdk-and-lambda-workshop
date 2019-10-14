# EC2 With Development Environment

Adjust the parameters in the `parameters.json` that will be provided to the CloudFormation template.

Launch EC2 instance via instantiating a CloudFormation stack:
```batch
rem change this name
rem it must be unique in the AWS region
rem where the stack is going to be created
set STACK_NAME=MyLovelyEc2DevBox

aws cloudformation create-stack --stack-name %STACK_NAME% ^
    --template-body file://ec2-with-tooling.yaml ^
    --parameters file://parameters.json

aws cloudformation wait stack-create-complete --stack-name %STACK_NAME%

aws cloudformation describe-stacks --stack-name %STACK_NAME%
```
Example output:
```
... some relatively non-important output ...
... and then comes the following below: ...
            "CreationTime": "2019-09-29T09:28:51.861Z",
            "RollbackConfiguration": {},
            "StackStatus": "CREATE_COMPLETE",
            "DisableRollback": false,
            "NotificationARNs": [],
            "Outputs": [
                {
                    "OutputKey": "InstanceId",
                    "OutputValue": "i-0ff17a9c70e3abacd",
                    "Description": "InstanceId of the newly created EC2 instance"
                },
                {
                    "OutputKey": "PublicIP",
                    "OutputValue": "34.205.85.134",
                    "Description": "Public IP address of the newly created EC2 instance"
                },
                {
                    "OutputKey": "AZ",
                    "OutputValue": "us-east-1b",
                    "Description": "Availability Zone of the newly created EC2 instance"
                },
                {
                    "OutputKey": "PublicDNS",
                    "OutputValue": "ec2-34-205-85-134.compute-1.amazonaws.com",
                    "Description": "Public DNSName of the newly created EC2 instance"
                }
            ],
            "Tags": [],
            "EnableTerminationProtection": false,
            "DriftInformation": {
                "StackDriftStatus": "NOT_CHECKED"
            }
        }
    ]
}
```
Use the public IP address (see the `"OutputKey": "PublicIP"` in the output) of the launched instance in order to SSH into it:
```batch
ssh -i C:\path\to\private-ssh-key ec2-user@34.205.85.134
```

You should see something like this:
```
Last login: Sun Sep 29 09:29:57 2019

       __|  __|_  )
       _|  (     /   Amazon Linux 2 AMI
      ___|\___|___|

https://aws.amazon.com/amazon-linux-2/
[ec2-user@ip-172-31-1-230 ~]$
```

Check that you have all the tools you'll need:
```
[ec2-user@ip-172-31-1-230 ~]$ git --version && aws --version && node --version && npm --version && cdk --version 
git version 2.17.2
aws-cli/1.16.102 Python/2.7.16 Linux/4.14.138-114.102.amzn2.x86_64 botocore/1.12.92
v12.12.0
6.11.3
0.39.0 (build c3a3c88)
```

Configure AWS CLI and check it is working:
```shell
[ec2-user@ip-172-31-1-230 ~]$ export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
[ec2-user@ip-172-31-1-230 ~]$ export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
[ec2-user@ip-172-31-1-230 ~]$ export AWS_DEFAULT_REGION=us-east-2
[ec2-user@ip-172-31-1-230 ~]$ export AWS_DEFAULT_OUTPUT=json
```

Check AWS CLI is configured correctly e.g. by listing S3 buckets:
```shell
[ec2-user@ip-172-31-1-230 ~]$ aws s3 ls
2019-04-05 08:23:23 bucket-1
2019-03-08 10:30:55 bucket-2
2018-12-20 12:40:40 one-more-s3-bucket
```
If AWS CLI is not configured correctly you'll get an error message.

When you don't need the instance any more, delete the corresponding CloudFormation stack:
```batch
set STACK_NAME=MyLovelyEc2DevBox

aws cloudformation delete-stack --stack-name %STACK_NAME%

aws cloudformation wait stack-delete-complete --stack-name %STACK_NAME%
```
