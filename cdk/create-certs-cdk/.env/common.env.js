//
// common.env.js
//
const {
  cdkCertHostedZoneId,
  cdkCertKeyPairName,
  cdkCertOneSecondaryDomain,
  cdkCertPrimaryDomain,
} = require('./.secrets.js')

const envCommon = {
  CDK_CERT_HOSTED_ZONE_ID: cdkCertHostedZoneId || '',
  CDK_CERT_KEY_PAIR_NAME: cdkCertKeyPairName || '',
  CDK_CERT_ONE_SECONDARY_DOMAIN: cdkCertOneSecondaryDomain || '',
  CDK_CERT_PRIMARY_DOMAIN: cdkCertPrimaryDomain || '',
}

module.exports = envCommon
