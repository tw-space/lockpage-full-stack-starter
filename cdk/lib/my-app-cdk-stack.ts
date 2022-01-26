import { Stack, StackProps, Tags, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import * as asg from 'aws-cdk-lib/aws-autoscaling'
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53targets from 'aws-cdk-lib/aws-route53-targets'
import { ServerDeploymentConfig } from 'aws-cdk-lib/aws-codedeploy';

declare var process: { env: { [key: string]: string } }

const appName = 'my-app'
const hostname = process.env.CDK_HOSTNAME
const hostedZoneId = process.env.CDK_HOSTED_ZONE_ID
const gitHubConnectionArn = process.env.CDK_GITHUB_CONNECTION_ARN
const gitHubOwner = process.env.CDK_GITHUB_OWNER
const gitHubRepo = process.env.CDK_GITHUB_REPO
const gitHubRepoBranch = 'master'
const httpsCertificateArn = process.env.CDK_HTTPS_CERTIFICATE_ARN

export class MyAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
      subnetConfiguration: [{
        name: `${appName}-public-`,
        subnetType: ec2.SubnetType.PUBLIC,
        cidrMask: 22,
        mapPublicIpOnLaunch: true,
      }],
      vpcName: `${appName}-vpc`,
    });

    //
    // |B| Configure security groups and IAM roles
    //

    // |1| Create ec2 security group to allow SSH (port 22), 
    const ec2SecurityGroup = new ec2.SecurityGroup(this, `${appName}-ec2-sg`, {
      vpc,
      description: `${appName}-ec2-sg`,
      allowAllOutbound: true
    });
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH any IPv4'
    );
    
    // |2| Create IAM role for EC2 and CodeDeploy 
    const ec2Role = new iam.Role(this, 'ec2-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    })
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AmazonEC2RoleforAWSCodeDeploy'
    ))
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSSMFullAccess'
        // 'AmazonSSMManagedInstanceCore' // not working
    ))

    //
    // |C| Create the auto scaling group
    //

    // |1| Prepare user data
    // TODO: user data script may need to explicitly call `cfn-signal` somehow
    const rawUserDataScript = readFileSync('./lib/codespace-setup.sh', 'utf8')
    const ec2UserData = ec2.UserData.custom(rawUserDataScript)
    
    // |2| Create the auto scaling group
    const ec2Asg = new asg.AutoScalingGroup(this, `${appName}-auto-scaling-group`, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.fromSsmParameter(
        '/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id',
        { os: ec2.OperatingSystemType.LINUX, },
      ),
      vpc,

      allowAllOutbound: true,
      associatePublicIpAddress: true,
      autoScalingGroupName: `${appName}-auto-scaling-group`,
      // TODO: add blockDevices
      keyName: 'ec2-default-key-pair',
      maxCapacity: 1,
      minCapacity: 1,
      requireImdsv2: true,
      role: ec2Role,
      securityGroup: ec2SecurityGroup,
      // signals: // TODO: probably something needed here; see ASG overview
      userData: ec2UserData,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      }
    })

    //
    // |D| Create Application Load Balancer
    //

    // |1| Create a security group for the load balancer

    const albSecurityGroup = new ec2.SecurityGroup(this, `${appName}-alb-sg`, {
      vpc,
      allowAllOutbound: false, // switched to false from true
      description: `${appName}-alb-sg`,
    });
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS any IPv4'
    );
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP any IPv4'
    );

    // |2| Create an Application Target Group

    const ec2TargetGroup = new elbv2.ApplicationTargetGroup(this, `${appName}-ec2-target-group`, {
      deregistrationDelay: cdk.Duration.seconds(60), // down from 300 to shorten BlockTraffic
      healthCheck: {
        healthyHttpCodes: '200,303',
        healthyThresholdCount: 2,
        interval: cdk.Duration.seconds(20),
        path: process.env.LOGIN_PATH,
        port: '80',
        protocol: elbv2.Protocol.HTTP,
        timeout: cdk.Duration.seconds(5),
        unhealthyThresholdCount: 2,
      },
      loadBalancingAlgorithmType: elbv2.TargetGroupLoadBalancingAlgorithmType.LEAST_OUTSTANDING_REQUESTS,
      // TODO: should port be non-default? docs suggest SGs auto-update to allow
      //       maybe 2022
      port: 80,
      // protocol: elbv2.ApplicationProtocol.HTTP, // determined from port
      stickinessCookieDuration: cdk.Duration.days(7),
      targetGroupName: `${appName}-ec2-target-group`,
      targets: [ ec2Asg, ],
      vpc
      // slowStart: ,
      // stickinessCookieName: ,
      // targetType: elbv2.TargetType.,  // determined automatically
    })
    
    // |2| Create an Application Load Balancer

    const alb = new elbv2.ApplicationLoadBalancer(this, `${appName}-load-balancer`, {
      vpc,
      internetFacing: true,
      loadBalancerName: `${appName}-load-balancer`,
      securityGroup: albSecurityGroup,
      // vpcSubnets: ,  // defaults to vpc strategy, but maybe details needed
    });

    // |3| Add listeners to the load balancer
    
    // Redirect all HTTP to HTTPS and strip subdomains
    const listenerHTTP = alb.addListener('httpRedirectListener', {
      defaultAction: elbv2.ListenerAction.redirect({
        host: hostname,
        permanent: true,
        port: '443',
        protocol: 'HTTPS',
        // path: 'path',    // keep path
        // query: 'query',  // keep query
      }),
      open: true,
      port: 80,
    })

    // Strip subdomains from HTTPS requests and otherwise forward to target group
    const listenerHTTPS = alb.addListener('httpsRedirectListener', {
      certificates: [
        elbv2.ListenerCertificate.fromArn(
          httpsCertificateArn
        ),
      ],
      defaultAction: elbv2.ListenerAction.forward(
        [ ec2TargetGroup, ],
        { stickinessDuration: cdk.Duration.minutes(30), }
      ),
      open: true,
      port: 443,
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
    })
    listenerHTTPS.addAction('stripSubDomain', {
      action: elbv2.ListenerAction.redirect({
        host: hostname,
        permanent: true,
        port: '443',
        protocol: 'HTTPS',
        // path: 'path',    // keep path
        // query: 'query',  // keep query
      }),
      conditions: [
        // TODO: fix. redirect not happening
        elbv2.ListenerCondition.hostHeaders([`*.${hostname}`]),
      ],
      priority: 10,
    })

    // |4| Allow secure connections from load balancer to auto scaling group

    alb.connections.allowTo(
      ec2Asg, 
      ec2.Port.tcp(80), // TODO: change to non-default port if not working
      "Allow HTTP from load balancer to auto scaling group",
    )

    //
    // |E| Associate Route53 DNS with Load Balancer
    //

    // |1| Get the existing public hosted zone

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this, `${appName}-hosted-zone`, {
        zoneName: `${hostname}.`,
        hostedZoneId: hostedZoneId,
      }
    )

    // |2| Add Alias Record to hosted zone to associate with load balancer

    new route53.ARecord(this, `${appName}-alias-record-for-load-balancer`, {
      target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(alb)),
      recordName: hostname,
      zone: hostedZone,
    })

    //
    // |F| Create pipeline
    //

    // |1| Create CodeDeploy application
    const codeDeployApp = new codedeploy.ServerApplication(this, `${appName}-cdk-app`, {
      applicationName: `${appName}-cdk-app`, // optional
    });

    // |2| Create IAM Role for Deployment Group for CodeDeploy
    const codeDeployRoleForDG = new iam.Role(this, 'codedeploy-iam-role-for-dg', {
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com')
    })
    codeDeployRoleForDG.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSCodeDeployRole'
    ))
    
    // |3| Create Deployment Group with role and app
    const deploymentGroup = new codedeploy.ServerDeploymentGroup(
      this, `${appName}-deployment-group`, {
        application: codeDeployApp,
        autoRollback: {
          failedDeployment: false, // default: true
          stoppedDeployment: false, // default: false
          deploymentInAlarm: false, // default: true if you provided any alarms, false otherwise
        },
        autoScalingGroups: [ ec2Asg, ],
        deploymentConfig: codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME,
        // deploymentConfig: new codedeploy.ServerDeploymentConfig(this, `${appName}-deployment-config`, {
        //   minimumHealthyHosts: codedeploy.MinimumHealthyHosts.count(1),  // or percentage
        // }),
        deploymentGroupName: `${appName}-deployment-group`,
        loadBalancer: codedeploy.LoadBalancer.application(ec2TargetGroup),
        role: codeDeployRoleForDG,

        // ec2InstanceTags: new codedeploy.InstanceTagSet({ 
        //   'Name': [`${appName}-ec2-instance`], 
        // }),

        // deploymentConfig possible values:
        // - ServerDeploymentConfig.ONE_AT_A_TIME (default)
        // - ServerDeploymentConfig.ALL_AT_ONCE
        // - ServerDeploymentConfig.HALF_AT_A_TIME
        // deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,

        // CloudWatch alarms
        //alarms: [alarm],
        // whether to ignore failure to fetch the status of alarms from CloudWatch (default: false)
        //ignorePollAlarmsFailure: false,

        // adds User Data that installs the CodeDeploy agent on your auto-scaling groups hosts (default: true)
        // installAgent: true,
      }
    )

    // |4| Prepare CodeCommit source info as Source Action
    // const sourceOutput = new codepipeline.Artifact()
    // const sourceRepo = codecommit.Repository.fromRepositoryName(
    //   this,
    //   'hello-world-node-cc',
    //   'hello-world-node',
    // )
    // const sourceCodeCommitAction = new codepipeline_actions.CodeCommitSourceAction({
    //   actionName: 'CodeCommit',
    //   repository: sourceRepo,
    //   output: sourceOutput,
    // })

    // |4alt1| This is Github version 1 with oauth token
    // Docs say GitHub requires Secrets Manager Secret @ $0.40/mo
    // But ssmSecure via Parameter Store is free
    // const sourceOutput = new codepipeline.Artifact()
    // const sourceGitHubAction = new codepipeline_actions.GitHubSourceAction({
    //   actionName: 'DownloadSource',
    //   owner: gitHubOwner,
    //   repo: gitHubRepo,
    //   oauthToken: SecretValue.ssmSecure(`/${gitHubOwner}/github-token`),
    //   output: new codepipeline.Artifact(),
    //   branch: 'master',   // default: 'master'
    // })

    // |4alt2| Github version 2 using (poorly named) Codestar Connection
    const sourceOutput = new codepipeline.Artifact()
    const sourceGitHubAction = new codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: `Source_${appName}`,
      owner: gitHubOwner,
      repo: gitHubRepo,
      branch: gitHubRepoBranch, // default: master
      connectionArn: gitHubConnectionArn,
      output: sourceOutput,
    });

    // |5| Prepare deploy info as Deploy Action
    const deployAction = new codepipeline_actions.CodeDeployServerDeployAction({
      actionName: `Deploy_${appName}`,
      deploymentGroup: deploymentGroup,
      input: sourceOutput,
    })

    // |6| Finally, create two-stage pipeline with earlier Source and Deploy actions
    const pipeline = new codepipeline.Pipeline(this, `${appName}-cdk-pipeline`, {
      crossAccountKeys: false,        // prevents new KMS key ($)
      pipelineName: `${appName}-cdk-pipeline`,
      stages: [
        {
          stageName: 'Source',
          actions: [
            sourceGitHubAction,
            // sourceCodeCommitAction,
          ],
        },
        {
          stageName: 'Deploy',
          actions: [deployAction],
        },
      ],
    }); 

    //
    // |G| Console output
    // 

    // Create outputs for connecting by ssh
    new cdk.CfnOutput(this, 'IP Address', { value: 'see EC2 console' });
    // new cdk.CfnOutput(this, 'Key Name', { value: 'key-pair-name' })
    // new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
  }
}
