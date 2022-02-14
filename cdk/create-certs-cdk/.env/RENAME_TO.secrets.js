//
// .secrets.js
//

// IMPORTANT: also set values in user-data/run-certbot.sh
const cdkCertHostedZoneId = '' // Route 53 hosted zone ID
const cdkCertKeyPairName = '' // (optional) ec2 key pair name
const cdkCertOneSecondaryDomain = '' // (optional) one secondary domain (SAN)
const cdkCertPrimaryDomain = '' // primary domain (CN) for certificate

module.exports = {
  cdkCertHostedZoneId,
  cdkCertKeyPairName,
  cdkCertOneSecondaryDomain,
  cdkCertPrimaryDomain,
}
