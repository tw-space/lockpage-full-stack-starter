#!/bin/bash
#
# setup-certificates.sh

# |0| Send logs to file and stdout; set errexit to start

set -e # enable errexit
logPath=/var/log/setup-certificates.log
exec > >(tee -a $logPath) 2>&1
echo "[$(date)]"

# |1| Set configuration variables

ec2UserHome="/home/ubuntu"

# |2| Prepare formatting variables

blue="\033[0;34m"
cyan="\033[0;36m"
red="\033[0;31m"
color_reset="\033[0m"
error="error"
info="info"
arrow="\xE2\x86\x92"

# |3| Check OK to proceed from cdk

echo "Checking whether to proceed (CDK_USE_HTTPS_FROM_S3)..."
useHttpsFromS3='REPLACE_WITH_CDK_USE_HTTPS_FROM_S3'

if [[ $useHttpsFromS3 != '1' ]]; then
  echo -e "$arrow https from S3 is not enabled; exiting"
  exit 1
else
  # Set local USE_HTTPS_FROM_S3 to 1
  echo "Setting $ec2UserHome/vars/USE_HTTPS_FROM_S3 to 1..."

  mkdir -p $ec2UserHome/vars
  echo '1' > $ec2UserHome/vars/USE_HTTPS_FROM_S3
  chown -R ubuntu $ec2UserHome/vars

  echo -e "$arrow done"
fi

# |4| Check AWS CLI is installed

echo "Verifying AWS CLI is installed..."
if ! command -v aws &> /dev/null; then
  echo ""
  echo -e "$red$error$color_reset AWS CLI command (aws) could not be found"
  exit 1
else
  echo -e "$arrow installed"
fi

# |5| Checking AWS credentials can access S3

echo "Checking AWS credentials can access S3..."
set +e # disable errexit
aws s3 ls 1> /dev/null
exitCodeAwsS3Ls=$?
if [[ $exitCodeAwsS3Ls -ne 0 ]]; then
  echo ""
  echo -e "$red$error$color_reset AWS credentials failed to access S3 with code: $exitCodeAwsS3Ls"
  echo -e "$blue$info$color_reset  Run$cyan aws configure$color_reset to set credentials for AWS CLI"
  exit 1
else
  echo -e "$arrow AWS credentials can access S3"
fi
set -e # reenable errexit

# |6| Get app hostname replaced by cdk

appHostname='REPLACE_WITH_HOSTNAME'

# |7| Check for secure-certificates bucket

echo "Checking for secure-certificates bucket..."
bucketName=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `secure-certificates-`) == `true`].[Name]' \
  --output text \
  | head -n 1)

# |8| Guard if bucket doesn't exist, exit

if [[ -z $bucketName ]]; then
  echo ""
  echo -e "$red$error$color_reset secure-certificates bucket not found"
  exit 1
fi

# Bucket exists
echo -e "$arrow found"

# |9| Guard if cert and key for domain don't exist, exit

echo "Checking certificate and key exists for $appHostname..."
set +e # disable errexit

certHead=$(aws s3api head-object \
  --bucket $bucketName \
  --key $appHostname/fullchain.pem 2> /dev/null)
keyHead=$(aws s3api head-object \
  --bucket $bucketName \
  --key $appHostname/privkey.pem 2> /dev/null)

set -e # reenable errexit
if [[ -z $certHead || -z $keyHead ]]; then
  echo ""
  echo -e "$red$error$color_reset certificate and key for $appHostname not both found"
  exit 1
fi

# Certificate and key for hostname both found
echo -e "$arrow both found"

# |10| Copy both to $ec2UserHome/server/.certificates

echo "Downloading certificate and key to $ec2UserHome/server/.certificates/..."

mkdir -p $ec2UserHome/server/.certificates
chown -R ubuntu $ec2UserHome/server

aws s3 cp \
  s3://$bucketName/$appHostname/fullchain.pem \
  $ec2UserHome/server/.certificates/fullchain.pem

aws s3 cp \
  s3://$bucketName/$appHostname/privkey.pem \
  $ec2UserHome/server/.certificates/privkey.pem

chown -R ubuntu $ec2UserHome/server

echo -e "$arrow done"

# |11| Hard link to letsencrypt location to support 'certbot renew'ing from ec2

echo "Hard linking to /etc/letsencrypt/live/$appHostname/ to support certbot renew..."

mkdir -p /etc/letsencrypt/live/$appHostname

ln \
  $ec2UserHome/server/.certificates/fullchain.pem \
  /etc/letsencrypt/live/$appHostname/fullchain.pem

ln \
  $ec2UserHome/server/.certificates/privkey.pem \
  /etc/letsencrypt/live/$appHostname/privkey.pem

echo -e "$arrow done"

# |12| Complete

echo "Complete"

