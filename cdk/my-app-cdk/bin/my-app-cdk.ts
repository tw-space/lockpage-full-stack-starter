#!/usr/bin/env node
/* eslint indent: ['off'] */
import 'source-map-support/register'
import { strict as assert } from 'assert'
import { randomUUID } from 'crypto'

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import * as cdk from 'aws-cdk-lib'

import { MyAppStack } from '../lib/my-app-cdk-stack' // eslint-disable-line

async function main() {
  const { artifactBucketExists, artifactBucketName } = await getArtifactBucketName()
  const app = new cdk.App()
  new MyAppStack(app, 'MyAppStack', {

    artifactBucketExists,
    artifactBucketName,
    
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */

    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    // env: { account: '123456789012', region: 'us-east-1' },

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  })
}

main()

/**
 * Checks S3 for a Source Artifact bucket and returns its name if found.
 * Otherwise, generates a name.
 * @returns {string} Name to assign to S3 bucket for Source Artifacts.
 */
async function getArtifactBucketName() {

  // |1| Get environment variables

  const appName = process.env.CDK_APP_NAME || 'my-app'
  const artifactS3Region = process.env.CDK_ARTIFACT_S3_REGION || ''

  try {
    assert(appName !== '', 'Error: CDK_APP_NAME cannot be null')
    assert(artifactS3Region !== '', 'Error: CDK_ARTIFACT_S3_REGION cannot be null')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  // |2| Get bucket list from S3
  
  const s3Client = new S3Client({
    region: artifactS3Region,
    tls: true,
  })
  const listBucketsCommand = new ListBucketsCommand({})

  let bucketListData
  try {
    bucketListData = await s3Client.send(listBucketsCommand)
  } catch (error) {
    console.error('s3 listBuckets failed: ', error)
  }

  // |3| Check for existing Source Artifact bucket

  const artifactBucketPrefix = `${appName}-artifacts`
  let artifactBucketExists = false // false is safer default
  let artifactBucketName = ''

  if (bucketListData !== undefined && bucketListData.Buckets?.length !== 0) {
    const bucketList = bucketListData.Buckets
    const existingArtifactBucket = bucketList?.find(
      (bucket) => bucket.Name?.startsWith(`${appName}-artifacts`),
    )
    
    artifactBucketName = existingArtifactBucket?.Name ?? ''
  }

  // |4| Generate new name if needed

  if (artifactBucketName === '') {
    const randomSuffixMaxLength = 62 - artifactBucketPrefix.length
    const uuid = randomUUID()
    const uuidSuffix = uuid.substring(0, randomSuffixMaxLength)

    artifactBucketName = `${artifactBucketPrefix}-${uuidSuffix}`
  } else {
    artifactBucketExists = true
  }

  return { artifactBucketExists, artifactBucketName }
}
