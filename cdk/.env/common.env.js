//
// common.env.js
//
const {
  cdkHostname,
  cdkHostedZoneId,
  cdkGitHubConnectionArn,
  cdkGitHubOwner,
  cdkGitHubRepo,
  cdkHttpsCertificateArn,
} = require('./.secrets.js')

const envCommon = {
  CDK_HOSTNAME: cdkHostname || '',
  CDK_HOSTED_ZONE_ID: cdkHostedZoneId || '',
  CDK_GITHUB_CONNECTION_ARN: cdkGitHubConnectionArn || '',
  CDK_GITHUB_OWNER: cdkGitHubOwner || '',
  CDK_GITHUB_REPO: cdkGitHubRepo || '',
  CDK_HTTPS_CERTIFICATE_ARN: cdkHttpsCertificateArn || '',
}

module.exports = envCommon
