//
// create-certs-cdk-stack.ts
//
import { strict as assert } from 'assert'
import { readFileSync } from 'fs'

import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

// declare var process: { env: { [key: string]: string } }

const appName = 'create-certs'
const hostedZoneId = process.env.CDK_CERT_HOSTED_ZONE_ID || ''
const primaryDomain = process.env.CDK_CERT_PRIMARY_DOMAIN || ''
const oneSecondaryDomain = process.env.CDK_CERT_ONE_SECONDARY_DOMAIN || ''
const keyPairName = process.env.CDK_CERT_KEY_PAIR_NAME || ''

export class CreateCertsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    //
    // |0| Guard preconditions
    //

    try {
      assert(hostedZoneId !== '', 'Error: hostedZoneId cannot be null')
      assert(primaryDomain !== '', 'Error: primaryDomain cannot be null')
    } catch (e) {
      console.error(e)
      process.exit(1)
    }

    //
    // |A| Create network
    //

    // Create new VPC with 1 subnet and 2 AZs
    const vpc = new ec2.Vpc(this, `${appName}-vpc`, {
      cidr: '10.0.0.0/26',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: `${appName}-public-`,
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 27,
          mapPublicIpOnLaunch: true,
        },
      ],
      vpcName: `${appName}-vpc`,
    })

    //
    // |B| Create the ec2 instance
    //

    // |1| Create ec2 security group

    const ec2SecurityGroup = new ec2.SecurityGroup(this, `${appName}-ec2-sg`, {
      vpc,
      description: `${appName}-ec2-sg`,
      allowAllOutbound: true,
    })
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP any IPv4')
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH any IPv4')
    
    // |2| Create IAM role for EC2 with S3 policies

    const ec2Role = new iam.Role(this, 'ec2-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    })
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
            's3:CreateBucket',
            's3:GetObject',
            's3:ListBucket',
            's3:PutBucketVersioning',
            's3:PutObject',
          ],
          resources: ['arn:aws:s3:::secure-certificates*'],
        }),
      ],
    }))
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSSMReadOnlyAccess',
      ),
    )

    // |3| Prepare user data scripts

    const rawInstallAwsScript = readFileSync('./user-data/install-aws.sh', 'utf8')
    const userDataInstallAws = ec2.UserData.custom(rawInstallAwsScript)
    const rawRunCertbotScript = readFileSync('./user-data/run-certbot.sh', 'utf8')
    const userDataRunCertbot = ec2.UserData.custom(rawRunCertbotScript)

    const ec2AllUserData = new ec2.MultipartUserData()
    ec2AllUserData.addUserDataPart(userDataInstallAws, ec2.MultipartBody.SHELL_SCRIPT, true)
    ec2AllUserData.addUserDataPart(userDataRunCertbot, ec2.MultipartBody.SHELL_SCRIPT, false)

    // |4| Create the ec2 instance
    
    const ec2InstanceName = `${appName}-ec2-instance`
    const ec2Instance = new ec2.Instance(this, ec2InstanceName, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.fromSsmParameter(
        '/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id',
        { os: ec2.OperatingSystemType.LINUX },
      ),
      vpc,

      allowAllOutbound: true,
      instanceName: ec2InstanceName,
      keyName: keyPairName,
      requireImdsv2: true,
      role: ec2Role,
      securityGroup: ec2SecurityGroup,
      userData: ec2AllUserData,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    })
    Tags.of(ec2Instance).add('Name', ec2InstanceName)

    //
    // |C| Associate Route53 DNS with ec2 instance
    //

    // |1| Get the existing public hosted zone

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `${appName}-hosted-zone`, {
      zoneName: `${primaryDomain}.`,
      hostedZoneId,
    })

    // |2| Associate Alias Record with ec2 instance

    new route53.ARecord(this, `${appName}-alias-record-for-instance-primary-domain`, {
      target: route53.RecordTarget.fromIpAddresses(ec2Instance.instancePublicIp),
      recordName: primaryDomain,
      zone: hostedZone,
    })

    if (oneSecondaryDomain !== '') {
      new route53.ARecord(this, `${appName}-alias-record-for-instance-secondary-domain`, {
        target: route53.RecordTarget.fromIpAddresses(ec2Instance.instancePublicIp),
        recordName: oneSecondaryDomain,
        zone: hostedZone,
      })
    }

    //
    // |D| Console output
    // 

    // Create outputs

    new CfnOutput(this, 'Primary Domain', { value: primaryDomain })
    new CfnOutput(this, 'Instance Public IP', { value: ec2Instance.instancePublicIp })
  }
}
