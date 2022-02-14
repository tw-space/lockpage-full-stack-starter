#!/bin/bash
#
# run-certbot.sh

# PREPARATIONS:
# |1| Set SSM Parameter Store settings in next section
# |2| Configure CDK_CERT values in step |4| or SSM Parameter Store
# |3| Verify certbot options are as desired in step |8.5|

# |IMPORTANT| Set to the region used for SSM Parameter Store
USE_SSM_PARAMETERS='true' # 'true' to use SSM Parameters
CDK_CERT_SSM_REGION='us-west-2'

# |0| Send logs to file and stdout; set errexit to start
set -e # enable errexit
logPath=/var/log/run-certbot.log
exec &> >(tee -a $logPath)
echo "[$(date)]"

# |1| Prepare formatting variables
# colors
blue="\033[0;34m"
color_reset="\033[0m"
cyan="\033[0;36m"
green="\033[0;32m"
red="\033[0;31m"
white="\033[0;37m"
# content
arrow="\xE2\x86\x92"
chevron="\xE2\x80\xBA"
error="error"
info="info"
success="Success!"

# |2| Check AWS CLI is installed
echo "Verifying AWS CLI is installed..."
if ! command -v aws &> /dev/null; then
  echo ""
  echo -e "$red$error$color_reset AWS CLI command (aws) could not be found"
  exit 1
else
  echo -e "$arrow installed"
fi

# |3| Checking AWS credentials can access S3
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

# |4| Configure these CDK_CERT variables in AWS SSM Parameter Store or here
if [[ $USE_SSM_PARAMETERS == 'true' ]]; then

  echo "Using parameters from AWS SSM Parameter Store..."
  set +e # disable errexit

  # |4.A| Set these parameters in AWS SSM parameter store like so:
  # 
  # $ aws ssm put-parameter \
  #   --name '/create-certs/cdkCertEmail' \
  #   --value 'YOUR_EMAIL' \
  #   --type 'SecureString'
  #
  # $ aws ssm put-parameter \
  #   --name '/create-certs/cdkCertS3Region' \
  #   --value 'YOUR_S3_REGION' \
  #   --type 'SecureString'
  #
  # $ aws ssm put-parameter \
  #   --name '/create-certs/cdkCertPrimaryDomain' \
  #   --value 'YOUR_PRIMARY_DOMAIN' \
  #   --type 'SecureString'
  #
  # (optional)
  # $ aws ssm put-parameter \
  #   --name '/create-certs/cdkCertOneSecondaryDomain' \
  #   --value 'YOUR_ONE_ADDITIONAL_DOMAIN' \
  #   --type 'SecureString'

  CDK_CERT_EMAIL=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertEmail' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  [[ $? -ne 0 ]] && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_EMAIL parameter not found in SSM" \
    && exit 1
  echo -e "$arrow CDK_CERT_EMAIL: $CDK_CERT_EMAIL"

  CDK_CERT_S3_REGION=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertS3Region' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  [[ $? -ne 0 ]] && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_S3_REGION parameter not found in SSM" \
    && exit 1
  echo -e "$arrow CDK_CERT_S3_REGION: $CDK_CERT_S3_REGION"

  CDK_CERT_PRIMARY_DOMAIN=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertPrimaryDomain' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  [[ $? -ne 0 ]] && echo "" \
    && echo -e "$red$error$color_reset CDK_CERT_PRIMARY_DOMAIN parameter not found in SSM" \
    && exit 1
  echo -e "$arrow CDK_CERT_PRIMARY_DOMAIN: $CDK_CERT_PRIMARY_DOMAIN"

  # (optional)
  CDK_CERT_ONE_SECONDARY_DOMAIN=$(aws ssm get-parameter \
    --name '/create-certs/cdkCertOneSecondaryDomain' \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region $CDK_CERT_SSM_REGION)
  echo -e "$arrow CDK_CERT_ONE_SECONDARY_DOMAIN: $CDK_CERT_ONE_SECONDARY_DOMAIN"
  
  set -e # reenable errexit
else

  echo "Using hardcoded CDK_CERT values..."

  # |4.B| Or hardcode these values

  CDK_CERT_EMAIL=
  CDK_CERT_S3_REGION=
  CDK_CERT_PRIMARY_DOMAIN=
  # (optional)
  CDK_CERT_ONE_SECONDARY_DOMAIN=
fi

# |5| Combine primary and secondary domains into single comma-separated string
if [[ -z CDK_CERT_ONE_SECONDARY_DOMAIN ]]; then
  CDK_CERT_ALL_DOMAINS=CDK_CERT_PRIMARY_DOMAIN
else
  CDK_CERT_ALL_DOMAINS=${CDK_CERT_PRIMARY_DOMAIN},${CDK_CERT_ONE_SECONDARY_DOMAIN}
fi

# |6| Check whether secure-certificates bucket exists already
echo "Checking for existing secure-certificates bucket..."
bucketName=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `secure-certificates-`) == `true`].[Name]' \
  --output text \
  | head -n 1)

# |7| If bucket exists, check if cert and key for domain exists
if [[ ! -z $bucketName ]]; then

  echo -e "$arrow existing secure-certificates bucket found"
  echo "Checking bucket for certificate and key for $CDK_CERT_PRIMARY_DOMAIN..."
  set +e # disable errexit

  certHead=$(aws s3api head-object \
    --bucket $bucketName \
    --key $CDK_CERT_PRIMARY_DOMAIN/fullchain.pem 2> /dev/null)
  keyHead=$(aws s3api head-object \
    --bucket $bucketName \
    --key $CDK_CERT_PRIMARY_DOMAIN/privkey.pem 2> /dev/null)
  
  # If cert and key for domain exist, exit
  if ! [[ -z $certHead || -z $keyHead ]]; then
    echo -e "$arrow certificate and key for $CDK_CERT_PRIMARY_DOMAIN found"
    echo -e "$arrow nothing to create, exiting"
    exit 1
  else
    echo -e "$arrow certificate and key for $CDK_CERT_PRIMARY_DOMAIN not both found, continuing"
  fi

  set -e # reenable errexit
fi

# |8| Create certificate and key when they don't exist locally already
echo "Verifying certificate and key don't already exist locally..."
if ! [[ -f /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem \
        && -f /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem ]]; then

  echo -e "$arrow local certificate and key not found"

  # |8.1| Ensure snapd is up-to-date
  echo "Updating snapd..."
  sudo snap install core; sudo snap refresh core

  # |8.2| Install certbot
  echo "Installing certbot..."
  sudo snap install --classic certbot

  # |8.3| Link certbot into PATH
  [[ ! -e /usr/bin/certbot ]] && sudo ln -s /snap/bin/certbot /usr/bin/certbot

  # |8.4| Wait 1 minute for Route53 DNS connection to be made
  echo "Waiting 1 minute for Route 53 DNS configuration and propagation..."
  sleep 1m

  # |8.5| Run certbot --standalone
  # See https://eff-certbot.readthedocs.io/en/stable/using.html#certbot-command-line-options
  # Outputs:
  # - /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem
  # - /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem
  echo "Generating certificate and key with certbot and provided configuration..."
  sudo certbot \
    certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email $CDK_CERT_EMAIL \
    --no-eff-email \
    --domain $CDK_CERT_ALL_DOMAINS

  # --register-unsafely-without-email \
  # --config-dir /tmp/config-dir/ \
  # --work-dir /tmp/work-dir/ \
  # --logs-dir /tmp/logs-dir/ \
  # --strict-permissions \
  # --manual-auth-hook /path/to/http/authenticator.sh \
  # --manual-cleanup-hook /path/to/http/cleanup.sh

  # |8.6| Verify certificate and key are created
  echo "Verifying certificate and key were created successfully..."
  if ! [[ -f /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem \
          && -f /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem ]]; then
    echo ""
    echo -e "$red$error$color_reset Certificate and key not found at /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN"
    echo -e "$blue$info$color_reset Check logs at $logPath"
    exit 1
  fi
else
  echo -e "$arrow local certificate and key found"
fi

# |9| Create bucket if doesn't exist already
if [[ -z $bucketName ]]; then

  echo "Configuring bucket name beginning with secure-certificates-..."

  # |9.1| Generate the bucket name
  rand35=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 35 | head -n 1)
  bucketName="secure-certificates-$rand35"
  echo -e "$arrow generated bucket name $bucketName"

  # |9.2| Create a versioned bucket in the proper region
  echo "Attempting to create bucket..."
  aws s3 mb s3://$bucketName --region $CDK_CERT_S3_REGION
  aws s3api put-bucket-versioning \
    --bucket $bucketName \
    --versioning-configuration Status=Enabled

  echo -e "$arrow created versioned bucket in $CDK_CERT_S3_REGION called $bucketName"
fi

# |10| Upload certificate and key to s3 bucket
if [[ -z $certHead ]]; then
  echo "Uploading $CDK_CERT_PRIMARY_DOMAIN/fullchain.pem to S3..."
  aws s3 cp \
    /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem \
    s3://$bucketName/$CDK_CERT_PRIMARY_DOMAIN/fullchain.pem
fi

if [[ -z $keyHead ]]; then
  echo "Uploading $CDK_CERT_PRIMARY_DOMAIN/privkey.pem to S3..."
  aws s3 cp \
    /etc/letsencrypt/live/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem \
    s3://$bucketName/$CDK_CERT_PRIMARY_DOMAIN/privkey.pem
fi

# |11| Success
echo ""
echo -e "$green$success$color_reset It's now safe to destroy this stack."
echo -e "$cyan$chevron$color_reset Run$cyan yarn cdk:destroy$color_reset from$white cdk/create-certs$color_reset on your development machine; or"
echo -e "$cyan$chevron$color_reset Destroy the stack from the CloudFormation console"
