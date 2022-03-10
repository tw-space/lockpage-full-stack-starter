//
// .secrets.js
//

// These database values must match `dbProd` parameter values set in AWS SSM Parameter Store
// See the project's .env/.secrets.js for details
const cdkDbDatabaseName = 'my_app_db'
const cdkDbPassword = 'change_this_password_right_away!'
const cdkDbPort = '5432'
const cdkDbUser = 'my_app_user'

const cdkAppName = 'my-app'
const cdkArtifactS3Region = ''
const cdkGitHubConnectionArn = ''
const cdkGitHubOwner = ''
const cdkGitHubRepo = ''
const cdkGitHubRepoBranch = ''
const cdkHostedZoneId = ''
const cdkHostname = ''
const cdkHttpsCertificateArn = ''
const cdkUseHttpsFromS3 = ''
const keyPairName = ''

module.exports = {
  cdkAppName,
  cdkArtifactS3Region,
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
}
