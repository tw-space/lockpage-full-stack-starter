#!/bin/bash
#
# certs-precheck.sh

# |0| Send logs to file and stdout
set -e # enable errexit
mkdir -p log
exec &> >(tee -a log/certs-precheck.log)
echo "[$(date)]"

# |1| Prepare colorize variables
blue="\033[0;34m"
cyan="\033[0;36m"
red="\033[0;31m"
color_reset="\033[0m"
error="error"
info="info"
arrow="\xE2\x86\x92"

# |2| Check needed environment variables are set
echo "Checking environment variables..."
if [[ -z "$CDK_CERT_PRIMARY_DOMAIN" \
      || -z "$CDK_CERT_HOSTED_ZONE_ID" ]]; then
  echo ""
  echo -e "$red$error$color_reset Expected CDK_CERT environment variables not set"
  echo -e "$blue$info$color_reset  Set cdkCert environment variable values in .env/.secrets.js"
  exit 1
else
  echo -e "$arrow found CDK_CERT_PRIMARY_DOMAIN"
fi

# |3| Check aws cli is installed
echo "Checking AWS CLI is installed..."
if ! command -v aws &> /dev/null; then
  echo ""
  echo -e "$red$error$color_reset AWS CLI command (aws) could not be found"
  echo -e "$blue$info$color_reset  Install the AWS CLI to continue"
  exit 1
else
  echo -e "$arrow installed"
fi

# |4| Checking credentials are configured for AWS CLI
echo "Checking credentials for AWS CLI are configured..."
set +e # disable errexit
aws s3 ls &> /dev/null
if [[ $? -eq 253 ]]; then
  echo ""
  echo -e "$red$error$color_reset Credentials for AWS CLI are not configured"
  echo -e "$blue$info$color_reset  Run$cyan aws configure$color_reset to set credentials for AWS CLI"
  exit 1
else
  echo -e "$arrow credentials are configured"
fi
set -e # reenable errexit

# |5| Check secure-certificates bucket already exists
echo "Verifying secure-certificates bucket is not already created..."
bucketName=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `secure-certificates-`) == `true`].[Name]' \
  --output text \
  | head -n 1)

# |6| If bucket exists, check cert and key for domain exists
if [[ ! -z $bucketName ]]; then

  echo -e "$arrow existing secure-certificates bucket found"
  
  echo "Checking for certificate and key for $CDK_CERT_PRIMARY_DOMAIN..."
  set +e # disable errexit

  certHead=$(aws s3api head-object \
    --bucket $bucketName \
    --key $CDK_CERT_PRIMARY_DOMAIN/fullchain.pem)
  keyHead=$(aws s3api head-object \
    --bucket $bucketName \
    --key $CDK_CERT_PRIMARY_DOMAIN/privkey.pem)

  # If cert and key for domain exist, exit
  if ! [[ -z $certHead || -z $keyHead ]]; then
    echo ""
    echo -e "$red$error$color_reset Certificate and key for $CDK_CERT_PRIMARY_DOMAIN already exist in secure-certificates bucket"
    echo -e "$blue$info$color_reset  Nothing to create, exiting"
    exit 1
  else
    echo -e "$arrow certificate and key for $CDK_CERT_PRIMARY_DOMAIN not found, ready to proceed"
  fi

  set -e #reenable errexit
else
  echo -e "$arrow bucket not yet created"
fi

# |7| Check run-certbot.sh variables are configured

# |7.1| Confirm run-certbot script file exists
runCertbotPath='user-data/run-certbot.sh'
if [[ ! -f $runCertbotPath ]]; then
  echo -e "$red$error$color_reset user-data/run-certbot.sh file not found"
  exit 1
fi

# |7.2| Check USE_SSM_PARAMETERS setting
echo "Checking USE_SSM_PARAMETERS..."
if grep -qr "USE_SSM_PARAMETERS='true'" $runCertbotPath; then

  echo -e "$arrow true"

  # |7.2.A.1| When using SSM Parameter Store, CDK_CERT_SSM_REGION must be set
  echo "Checking CDK_CERT_SSM_REGION..."
  if grep -qr 'CDK_CERT_SSM_REGION=$' $runCertbotPath; then
    echo ""
    echo -e "$red$error$color_reset CDK_CERT_SSM_REGION not set in run-certbot.sh"
    echo -e "$blue$info$color_reset The region where SSM Parameters are stored must be provided"
    exit 1
  else
    echo -e "$arrow found"
  fi

  # |7.2.A.2| When using SSM Parameter Store, required parameters must be found in SSM
  echo "Checking for parameters in AWS SSM Parameter Store..."
  set +e # disable errexit

  get_email=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertEmail' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text)
  [[ $? -ne 0 ]] \
    && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_EMAIL parameter not found in SSM" \
    && echo -e "$blue$info$color_reset CDK_CERT values must be set in either run-certbot.sh or SSM Parameter Store" \
    && exit 1
  
  get_s3_region=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertS3Region' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text)
  [[ $? -ne 0 ]] \
    && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_S3_REGION parameter not found in SSM" \
    && echo -e "$blue$info$color_reset CDK_CERT values must be set in either run-certbot.sh or SSM Parameter Store" \
    && exit 1

  get_primary_domain=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertPrimaryDomain' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text)
  [[ $? -ne 0 ]] \
    && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_PRIMARY_DOMAIN parameter not found in SSM" \
    && echo -e "$blue$info$color_reset CDK_CERT values must be set in either run-certbot.sh or SSM Parameter Store" \
    && exit 1
    
  echo -e "$arrow required CDK_CERT parameters found in SSM"
  set -e # reenable errexit
  
else

  echo -e "$arrow false"

  echo "Checking for hardcoded values in user-data/run-certbot.sh..."

  # |7.2.B.1| When NOT using SSM Parameters, hardcoded values cannot be empty
  if grep -qr 'CDK_CERT_EMAIL=$' $runCertbotPath \
     || grep -qr 'CDK_CERT_S3_REGION=$' $runCertbotPath \
     || grep -qr 'CDK_CERT_PRIMARY_DOMAIN=$' $runCertbotPath; then

    echo "" \
    && echo -e "$red$error$color_reset Expected CDK_CERT values not found in user-data/run-certbot.sh" \
    && echo -e "$blue$info$color_reset Hardcode the expected values or use SSM Parameter Store" \
    && exit 1
  else
    echo -e "$arrow expected CDK_CERT values found"
  fi
fi

echo "Precheck successful. Ready to proceed"
