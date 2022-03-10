//
// my-app-cdk-stack.ts
//
import { strict as assert } from 'assert'
import { readFileSync } from 'fs'

import {
  CfnOutput,
  // CfnResource,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
  SecretValue,
  Tags,
} from 'aws-cdk-lib'
// import * as asg from 'aws-cdk-lib/aws-autoscaling'
// import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy'
// import { ServerDeploymentConfig } from 'aws-cdk-lib/aws-codedeploy'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
// import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as route53 from 'aws-cdk-lib/aws-route53'
// import * as route53targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

const appName = 'my-app'
const dbAvailabilityZone = `${process.env.CDK_DEFAULT_REGION}a`
const dbDatabaseName = process.env.CDK_DB_DATABASE_NAME || ''
const dbPassword = process.env.CDK_DB_PASSWORD || ''
const dbPort = parseInt(process.env.CDK_DB_PORT || '', 10)
const dbUser = process.env.CDK_DB_USER || ''
const hostedZoneId = process.env.CDK_HOSTED_ZONE_ID || ''
const hostname = process.env.CDK_HOSTNAME || ''
const gitHubConnectionArn = process.env.CDK_GITHUB_CONNECTION_ARN || ''
const gitHubOwner = process.env.CDK_GITHUB_OWNER || ''
const gitHubRepo = process.env.CDK_GITHUB_REPO || ''
const gitHubRepoBranch = process.env.CDK_GITHUB_REPO_BRANCH || ''
// const httpsCertificateArn = process.env.CDK_HTTPS_CERTIFICATE_ARN
const keyPairName = process.env.KEY_PAIR_NAME || ''
const useHttpsFromS3 = process.env.CDK_USE_HTTPS_FROM_S3 || ''
const stackName = 'MyAppStack'

type MyAppStackProps = StackProps & {
  artifactBucketName: string,
  artifactBucketExists: boolean,
}
// declare var process: { env: { [key: string]: string } }

export class MyAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: MyAppStackProps) {
    super(scope, id, props)

    // Props

    const artifactBucketName = props?.artifactBucketName || ''
    const artifactBucketExists = props?.artifactBucketExists || false

    //
    // |0| Guard preconditions
    //

    try {
      assert(
        dbAvailabilityZone.match(/^[a-z]+-([a-z]+-)?[a-z]+-[1-9][abcdefg]$/) !== null,
        'Error: dbAvailabilityZone must be valid',
      )
      assert(artifactBucketName !== '', 'Error: artifactBucketName prop cannot be null')
      assert(dbPassword !== '', 'Error: CDK_DB_PASSWORD cannot be null')
      assert(dbUser !== '', 'Error: CDK_DB_USER cannot be null')
      assert(keyPairName !== '', 'Error: KEY_PAIR_NAME cannot be null')
      assert(hostedZoneId !== '', 'Error: CDK_HOSTED_ZONE_ID cannot be null')
      assert(hostname !== '', 'Error: CDK_HOSTNAME cannot be null')
    } catch (e) {
      console.error(e)
      process.exit(1)
    }

    //
    // |A| Create network
    //

    // Create new VPC with 1 subnet and 2 AZs
    const vpc = new ec2.Vpc(this, `${appName}-vpc`, {
      cidr: '10.0.0.0/20',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: `${appName}-public-`,
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 22,
          mapPublicIpOnLaunch: true,
        },
        {
          name: `${appName}-isolated-`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 27,
          reserved: false,
        },
      ],
      vpcName: `${appName}-vpc`,
    })

    //
    // |B| Create DB Instance
    //
    
    // |1| Create ec2 security group
    
    const rdsPgSecurityGroup = new ec2.SecurityGroup(this, `${appName}-rds-pg-sg`, {
      vpc,
      description: `${appName}-rds-pg-sg`,
      allowAllOutbound: false,
    })

    // |2| Create RDS instance

    const rdsPgInstanceName = `${appName}-rds-pg-instance`
    const rdsPgInstance = new rds.DatabaseInstance(this, rdsPgInstanceName, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_9, // latest for free tier
      }),
      vpc,
      
      allocatedStorage: 19, // maxAllocated must be greater
      allowMajorVersionUpgrade: false,
      availabilityZone: dbAvailabilityZone,
      backupRetention: Duration.days(0),
      autoMinorVersionUpgrade: false,
      // cloudwatchLogsExports: [
      //   'alert',
      //   'audit',
      //   'error',
      //   'general',
      //   'listener',
      //   'slowquery',
      //   'trace',
      // ],
      // cloudwatchLogsRetention: ,
      credentials: rds.Credentials.fromPassword(
        dbUser,
        SecretValue.plainText(dbPassword),
      ),
      databaseName: dbDatabaseName,
      deleteAutomatedBackups: true,
      deletionProtection: false,
      enablePerformanceInsights: true,
      // iamAuthentication: false,
      instanceIdentifier: rdsPgInstanceName,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO,
      ),
      // iops: ,
      // licenseModel: rds.LicenseModel.BRING_YOUR_OWN_LICENSE,
      maxAllocatedStorage: 20, // free tier is 20
      monitoringInterval: Duration.seconds(60),
      multiAz: false,
      // parameterGroup: ,
      performanceInsightRetention: 7, // must be 7 or 731
      port: dbPort,
      publiclyAccessible: false,
      removalPolicy: RemovalPolicy.DESTROY,
      securityGroups: [rdsPgSecurityGroup],
      storageEncrypted: false,
      // storageEncryptionKey: ,
      // storageType: rds.StorageType.GP2,
      vpcSubnets: { // type of subnets to add to the created DB subnet group
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    })

    // |3| Allow connections with ec2 auto scaling group

    // rdsPgInstance.connections.allowFrom(ec2Asg, ec2.Port.tcp(dbPort))
    // rdsPgInstance.connections.allowFrom(ec2Instance, ec2.Port.tcp(dbPort))
    // rdsPgInstance.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(dbPort))

    // |4| Add CloudWatch alarms

    // High CPU
    // new cloudwatch.Alarm(this, 'HighCPU', {
    //   metric: rdsPgInstance.metricCPUUtilization(),
    //   threshold: 90,
    //   evaluationPeriods: 1,
    // })

    // |5| Rotate password when secret in Secrets Manager

    // rdsPgInstance.addRotationSingleUser({
    //   automaticallyAfter: cdk.Duration.days(30), // defaults to 30 days
    //   excludeCharacters: '!@#$%^&*', // defaults to the set " %+~`#$&*()|[]{}:;<>?!'/@\"\\"
    // })

    // |6| Trigger Lambda function on instance availability events
    
    // const fn = new lambda.Function(this, 'Function', {
    //   code: lambda.Code.fromInline('exports.handler = (event) => console.log(event);'),
    //   handler: 'index.handler',
    //   runtime: lambda.Runtime.NODEJS_12_X,
    // })

    // const availabilityRule = rdsPgInstance.onEvent(
    ///  'Availability', 
    //   { target: new targets.LambdaFunction(fn) }
    // )
    // availabilityRule.addEventPattern({
    //   detail: {
    //     EventCategories: [
    //       'availability',
    //     ],
    //   },
    // })

    //
    // |C| Create the ec2 auto scaling group (prod) or instance (staging)
    //

    // |1| Create ec2 security group

    const ec2SecurityGroup = new ec2.SecurityGroup(this, `${appName}-ec2-sg`, {
      vpc,
      description: `${appName}-ec2-sg`,
      allowAllOutbound: true,
    })
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS any IPv4')
    // ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH any IPv4')
    
    // |2| Create IAM role for EC2 and CodeDeploy 

    const ec2Role = new iam.Role(this, 'ec2-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    })
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSSMReadOnlyAccess',
      ),
    )
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AmazonEC2RoleforAWSCodeDeploy',
      ),
    )
    ec2Role.attachInlinePolicy(new iam.Policy(this, 's3-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: [
            's3:GetBucketLocation',
            's3:ListAllMyBuckets',
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          actions: [
            's3:GetObject',
            's3:ListBucket',
          ],
          resources: ['arn:aws:s3:::secure-certificates*'],
        }),
      ],
    }))
    ec2Role.attachInlinePolicy(new iam.Policy(this, 'Ec2DescribeInstancesPolicy', {
      statements: [
        new iam.PolicyStatement({
          actions: [
            'ec2:DescribeInstances',
            'ec2:DescribeTags',
          ],
          resources: ['*'],
        }),
      ],
    }))

    // |3| Prepare setup scripts as user data

    const rawCodespaceScript = readFileSync('./user-data/setup-codespace.sh', 'utf8')
    const userDataCodespace = ec2.UserData.custom(rawCodespaceScript)

    // |4| Prepare rds setup script as user data

    const dbEndpoint = rdsPgInstance.instanceEndpoint.socketAddress
    const rawSetupRdsScript = readFileSync('./user-data/setup-rdscat-and-rds-var.sh', 'utf8')
    let fixedSetupRdsScript = rawSetupRdsScript.replace(/PORT/g, dbPort.toString())
    fixedSetupRdsScript = fixedSetupRdsScript.replace(/ENDPOINT/g, dbEndpoint)
    const userDataSetupRds = ec2.UserData.custom(fixedSetupRdsScript)

    // |5| Prepare setup certificates script as user data

    const rawCertificatesScript = readFileSync('./user-data/setup-certificates.sh', 'utf8')
    let fixedCertificatesScript = rawCertificatesScript.replace(/REPLACE_WITH_HOSTNAME/g, hostname)
    fixedCertificatesScript = fixedCertificatesScript.replace(/REPLACE_WITH_CDK_USE_HTTPS_FROM_S3/g, useHttpsFromS3)
    const userDataCertificates = ec2.UserData.custom(fixedCertificatesScript)

    // |6| Prepare multipart user data

    const ec2AllUserData = new ec2.MultipartUserData()
    ec2AllUserData.addUserDataPart(userDataCodespace, ec2.MultipartBody.SHELL_SCRIPT, true)
    ec2AllUserData.addUserDataPart(userDataSetupRds, ec2.MultipartBody.SHELL_SCRIPT, false)
    ec2AllUserData.addUserDataPart(userDataCertificates, ec2.MultipartBody.SHELL_SCRIPT, false)

    // TODO: user data script may need to explicitly call `cfn-signal` somehow,
    // maybe with:
    //    ec2UserData.addSignalOnExitCommand(resource)
    
    // // |6| Create the auto scaling group
    // const ec2Asg = new asg.AutoScalingGroup(this, `${appName}-auto-scaling-group`, {
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    //   machineImage: ec2.MachineImage.fromSsmParameter(
    //     '/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id',
    //     { os: ec2.OperatingSystemType.LINUX },
    //   ),
    //   vpc,

    //   allowAllOutbound: true,
    //   associatePublicIpAddress: true,
    //   autoScalingGroupName: `${appName}-auto-scaling-group`,
    //   // TODO: add blockDevices
    //   keyName: keyPairName,
    //   instanceMonitoring: asg.Monitoring.BASIC, // DETAILED default $$$
    //   maxCapacity: 1,
    //   minCapacity: 1,
    //   requireImdsv2: true,
    //   role: ec2Role,
    //   securityGroup: ec2SecurityGroup,
    //   // signals: // TODO: probably something needed here; see ASG overview
    //   userData: ec2UserData,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PUBLIC,
    //   },
    // })

    // |7| Create the ec2 instance
    
    const ec2InstanceName = `${appName}-ec2-instance`
    const ec2Instance = new ec2.Instance(this, ec2InstanceName, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.fromSsmParameter(
        '/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id',
        { os: ec2.OperatingSystemType.LINUX },
      ),
      vpc,

      allowAllOutbound: true,
      availabilityZone: dbAvailabilityZone,
      // TODO: add blockDevices
      instanceName: ec2InstanceName,
      keyName: keyPairName,
      propagateTagsToVolumeOnCreation: true,
      requireImdsv2: true,
      role: ec2Role,
      securityGroup: ec2SecurityGroup,
      userData: ec2AllUserData,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    })

    // |8| Assign tags

    Tags.of(ec2Instance).add('Name', ec2InstanceName) // for CodeDeploy
    Tags.of(ec2Instance).add('Stack', stackName)
    
    // |9| Set CreationPolicy for ec2 instance for cfn-signal

    // const cfnEc2Instance = ec2Instance.node.defaultChild as CfnResource
    // const ec2LogicalId = cfnEc2Instance.logicalId
    // Tags.of(ec2Instance).add('Ec2LogicalID', ec2LogicalId) // for cfn-signal
    // cfnEc2Instance.cfnOptions.creationPolicy = {
    //   resourceSignal: {
    //     count: 1,
    //     timeout: 'PT4M',
    //   },
    // }

    // |10| Allow connections between ec2 and database

    // rdsPgInstance.connections.allowFrom(ec2Asg, ec2.Port.tcp(dbPort))
    rdsPgInstance.connections.allowFrom(ec2Instance, ec2.Port.tcp(dbPort))
    // rdsPgInstance.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(dbPort))

    // //
    // // |D| Create Application Load Balancer
    // //

    // // |1| Create a security group for the load balancer

    // const albSecurityGroup = new ec2.SecurityGroup(this, `${appName}-alb-sg`, {
    //   vpc,
    //   allowAllOutbound: false, // switched to false from true
    //   description: `${appName}-alb-sg`,
    // })
    // albSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS any IPv4'
    // )
    // albSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP any IPv4'
    // )

    // // |2| Create an Application Target Group

    // const ec2TargetGroup = new elbv2.ApplicationTargetGroup(this, `${appName}-ec2-target-group`, {
    //   deregistrationDelay: cdk.Duration.seconds(60), // down from 300 to shorten BlockTraffic
    //   healthCheck: {
    //     healthyHttpCodes: '200,303',
    //     healthyThresholdCount: 2,
    //     interval: cdk.Duration.seconds(20),
    //     path: process.env.LOGIN_PATH,
    //     port: '80',
    //     protocol: elbv2.Protocol.HTTP,
    //     timeout: cdk.Duration.seconds(5),
    //     unhealthyThresholdCount: 2,
    //   },
    //   loadBalancingAlgorithmType: elbv2.TargetGroupLoadBalancingAlgorithmType.LEAST_OUTSTANDING_REQUESTS,
    //   // TODO: should port be non-default? docs suggest SGs auto-update to allow
    //   //       maybe 2022
    //   port: 80,
    //   // protocol: elbv2.ApplicationProtocol.HTTP, // determined from port
    //   stickinessCookieDuration: cdk.Duration.days(7),
    //   targetGroupName: `${appName}-ec2-target-group`,
    //   targets: [ ec2Asg, ],
    //   vpc
    //   // slowStart: ,
    //   // stickinessCookieName: ,
    //   // targetType: elbv2.TargetType.,  // determined automatically
    // })
    
    // // |2| Create an Application Load Balancer

    // const alb = new elbv2.ApplicationLoadBalancer(this, `${appName}-load-balancer`, {
    //   vpc,
    //   internetFacing: true,
    //   loadBalancerName: `${appName}-load-balancer`,
    //   securityGroup: albSecurityGroup,
    //   // vpcSubnets: ,  // defaults to vpc strategy, but maybe details needed
    // })

    // // |3| Add listeners to the load balancer
    
    // // Redirect all HTTP to HTTPS and strip subdomains
    // const listenerHTTP = alb.addListener('httpRedirectListener', {
    //   defaultAction: elbv2.ListenerAction.redirect({
    //     host: hostname,
    //     permanent: true,
    //     port: '443',
    //     protocol: 'HTTPS',
    //     // path: 'path',    // keep path
    //     // query: 'query',  // keep query
    //   }),
    //   open: true,
    //   port: 80,
    // })

    // // Strip subdomains from HTTPS requests and otherwise forward to target group
    // const listenerHTTPS = alb.addListener('httpsRedirectListener', {
    //   certificates: [
    //     elbv2.ListenerCertificate.fromArn(
    //       httpsCertificateArn
    //     ),
    //   ],
    //   defaultAction: elbv2.ListenerAction.forward(
    //     [ ec2TargetGroup, ],
    //     { stickinessDuration: cdk.Duration.minutes(30), }
    //   ),
    //   open: true,
    //   port: 443,
    //   sslPolicy: elbv2.SslPolicy.RECOMMENDED,
    // })
    // listenerHTTPS.addAction('stripSubDomain', {
    //   action: elbv2.ListenerAction.redirect({
    //     host: hostname,
    //     permanent: true,
    //     port: '443',
    //     protocol: 'HTTPS',
    //     // path: 'path',    // keep path
    //     // query: 'query',  // keep query
    //   }),
    //   conditions: [
    //     // TODO: fix. redirect not happening
    //     elbv2.ListenerCondition.hostHeaders([`*.${hostname}`]),
    //   ],
    //   priority: 10,
    // })

    // // |4| Allow secure connections from load balancer to auto scaling group

    // alb.connections.allowTo(
    //   ec2Asg, 
    //   ec2.Port.tcp(80), // TODO: change to non-default port if not working
    //   "Allow HTTP from load balancer to auto scaling group",
    // )

    //
    // |E| Associate Route53 DNS with Load Balancer
    //

    // |1| Get the existing public hosted zone

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `${appName}-hosted-zone`, {
      zoneName: `${hostname}.`,
      hostedZoneId,
    })

    // // |2| Add Alias Record to hosted zone to associate with load balancer (prod)

    // new route53.ARecord(this, `${appName}-alias-record-for-load-balancer`, {
    //   target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(alb)),
    //   recordName: hostname,
    //   zone: hostedZone,
    // })
    
    // |2| Add Alias Record to hosted zone to associate with ec2 instance

    new route53.ARecord(this, `${appName}-alias-record-for-instance`, {
      target: route53.RecordTarget.fromIpAddresses(ec2Instance.instancePublicIp),
      recordName: hostname,
      zone: hostedZone,
    })

    //
    // |F| Create pipeline
    //

    // |1| Create an S3 artifact bucket using name passed in to stack
    
    let s3ArtifactBucket
    if (artifactBucketExists) {
      s3ArtifactBucket = s3.Bucket.fromBucketAttributes(this, `${appName}-bucket`, {
        bucketName: artifactBucketName,
      })
    } else {
      s3ArtifactBucket = new s3.Bucket(this, `${appName}-bucket`, {
        accessControl: s3.BucketAccessControl.PRIVATE,
        autoDeleteObjects: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        bucketKeyEnabled: false,
        bucketName: artifactBucketName,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.RETAIN,
        versioned: false,
      })
    }

    // |2| Create empty pipeline

    if (!s3ArtifactBucket) {
      throw new Error("s3 Artifact Bucket isn't defined")
    }

    const pipeline = new codepipeline.Pipeline(this, `${appName}-pipeline`, {
      artifactBucket: s3ArtifactBucket,
      crossAccountKeys: false, // prevents new KMS key ($)
      pipelineName: `${appName}-pipeline`,
    })

    // |3| Add dependency on ec2 instance
    //     (Alternative to try if waiting until user data completes is ever needed:
    //        1. create WaitConditionHandle construct
    //        2. create WaitCondition which takes WaitConditionHandle's ref (cfnOptions)
    //        3. add CreationPolicy to WaitCondition
    //        4. pass WaitCondition's logical ID to ec2 as tag (or pass WaitConditionHandle somehow)
    //        5. add dependency to pipeline on WaitCondition)

    pipeline.node.addDependency(ec2Instance)

    // |4| Add Source_To_S3 stage (#1) with GitHub source
    
    // Hypothesis: This artifact will create in target S3 bucket due to its
    // association with the Source Actions
    const sourceOutput = new codepipeline.Artifact('Source_Artifact')
    const sourceGitHubAction = new codepipelineActions.CodeStarConnectionsSourceAction({
      actionName: 'Source_To_S3',
      branch: gitHubRepoBranch, // default: master
      connectionArn: gitHubConnectionArn,
      output: sourceOutput,
      owner: gitHubOwner,
      repo: gitHubRepo,
    })
    
    pipeline.addStage({
      stageName: 'Source_To_S3',
      actions: [sourceGitHubAction],
    })

    // |5| Deploy app to stack

    const codeDeployApp = new codedeploy.ServerApplication(this, `${appName}-cdk-app`, {
      applicationName: `${appName}-cdk-app`, // optional
    })

    const codeDeployRoleForDG = new iam.Role(this, 'codedeploy-iam-role-for-dg', {
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
    })
    
    codeDeployRoleForDG.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSCodeDeployRole',
      ),
    )

    // Deployment Group to instance
    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, `${appName}-deployment-group`, {
      application: codeDeployApp,
      autoRollback: {
        failedDeployment: false, // default: true
        stoppedDeployment: false, // default: false
        deploymentInAlarm: false, // default: true if you provided any alarms, false otherwise
      },
      deploymentConfig: codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME,
      deploymentGroupName: `${appName}-deployment-group`,
      ec2InstanceTags: new codedeploy.InstanceTagSet({
        Name: [ec2InstanceName],
      }),
      role: codeDeployRoleForDG,
      // autoScalingGroups: [ ec2Asg, ],
      // loadBalancer: codedeploy.LoadBalancer.application(ec2TargetGroup),
    })
    
    // |alt| Deployment Group to auto scaling group and load balancer
    // const deploymentGroup = new codedeploy.ServerDeploymentGroup(
    //   this, `${appName}-deployment-group`, {
    //     application: codeDeployApp,
    //     autoRollback: {
    //       failedDeployment: false, // default: true
    //       stoppedDeployment: false, // default: false
    //       deploymentInAlarm: false, // default: true if you provided any alarms, false otherwise
    //     },
    //     autoScalingGroups: [ ec2Asg, ],
    //     deploymentConfig: codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME,
    //     // deploymentConfig: new codedeploy.ServerDeploymentConfig(this, `${appName}-deployment-config`, {
    //     //   minimumHealthyHosts: codedeploy.MinimumHealthyHosts.count(1),  // or percentage
    //     // }),
    //     deploymentGroupName: `${appName}-deployment-group`,
    //     loadBalancer: codedeploy.LoadBalancer.application(ec2TargetGroup),
    //     role: codeDeployRoleForDG,

    //     // ec2InstanceTags: new codedeploy.InstanceTagSet({ 
    //     //   'Name': [`${appName}-ec2-instance`], 
    //     // }),

    //     // deploymentConfig possible values:
    //     // - ServerDeploymentConfig.ONE_AT_A_TIME (default)
    //     // - ServerDeploymentConfig.ALL_AT_ONCE
    //     // - ServerDeploymentConfig.HALF_AT_A_TIME
    //     // deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,

    //     // CloudWatch alarms
    //     //alarms: [alarm],
    //     // whether to ignore failure to fetch the status of alarms from CloudWatch (default: false)
    //     //ignorePollAlarmsFailure: false,

    //     // adds User Data that installs the CodeDeploy agent on your auto-scaling groups hosts (default: true)
    //     // installAgent: true,
    //   }
    // )

    const deployAction = new codepipelineActions.CodeDeployServerDeployAction({
      actionName: 'Deploy_App_To_Stack',
      deploymentGroup,
      input: sourceOutput,
    })

    pipeline.addStage({
      stageName: 'Deploy_App_To_Stack',
      actions: [deployAction],
    })

    //
    // |G| Console output
    // 

    // Create outputs

    new CfnOutput(this, 'AvailabilityZones', {
      value: Stack.of(this).availabilityZones.toString(),
    })
    new CfnOutput(this, 'DBEndpoint', { value: rdsPgInstance.instanceEndpoint.socketAddress })
    new CfnOutput(this, 'Hostname', { value: hostname })
    new CfnOutput(this, 'InstancePublicIP', { value: ec2Instance.instancePublicIp })
    new CfnOutput(this, 'NextSteps', {
      value: 'Whitelist your machine IP in the ec2 instance security group then visit your app in the browser at the hostname above',
    })
    new CfnOutput(this, 'UsingHTTPS', { value: useHttpsFromS3 === '1' ? 'Yes' : 'No' })
    // new cdk.CfnOutput(this, 'Key Name', { value: 'key-pair-name' })
  }
}
