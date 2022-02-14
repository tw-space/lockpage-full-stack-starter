//
// production.env.js
//
const envCommon = require('./common.env.js')
const {
  cdkDbDatabaseName,
  cdkDbPassword,
  cdkDbPort,
  cdkDbUser,
  cdkGitHubConnectionArn,
  cdkGitHubOwner,
  cdkGitHubRepo,
  cdkGitHubRepoBranch,
  cdkHostedZoneId,
  cdkHostname,
  cdkHttpsCertificateArn,
  cdkUseHttpsFromS3,
  keyPairName,
} = require('./.secrets.js')

const envProduction = {
  ...envCommon,
  CDK_DB_DATABASE_NAME: cdkDbDatabaseName || '',
  CDK_DB_PASSWORD: cdkDbPassword || '',
  CDK_DB_PORT: cdkDbPort || '',
  CDK_DB_USER: cdkDbUser || '',
  CDK_GITHUB_CONNECTION_ARN: cdkGitHubConnectionArn || '',
  CDK_GITHUB_OWNER: cdkGitHubOwner || '',
  CDK_GITHUB_REPO: cdkGitHubRepo || '',
  CDK_GITHUB_REPO_BRANCH: cdkGitHubRepoBranch || '',
  CDK_HOSTED_ZONE_ID: cdkHostedZoneId || '',
  CDK_HOSTNAME: cdkHostname || '',
  CDK_HTTPS_CERTIFICATE_ARN: cdkHttpsCertificateArn || '',
  CDK_USE_HTTPS_FROM_S3: cdkUseHttpsFromS3 || '0',
  KEY_PAIR_NAME: keyPairName || '',
}

module.exports = envProduction
