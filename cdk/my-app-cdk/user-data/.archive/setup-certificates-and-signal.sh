#!/bin/bash
#
# setup-certificates.sh

# |0| Logs

set -ex
logPath=/var/log/setup-certificates.log
exec > >(tee -a $logPath) 2>&1
echo "[$(date)]"

# |1| Vars

ec2UserHome="/home/ubuntu"

# |2| Formatting

arrow="\xE2\x86\x92"

# |3|

echo "Checking CDK_USE_HTTPS_FROM_S3..."
useHttpsFromS3='REPLACE_WITH_CDK_USE_HTTPS_FROM_S3'

if [[ $useHttpsFromS3 != '1' ]]; then
  echo -e "$arrow https from S3 is not enabled"
  exit 1
else
  echo "Setting $ec2UserHome/vars/USE_HTTPS_FROM_S3 to 1..."

  mkdir -p $ec2UserHome/vars
  echo '1' > $ec2UserHome/vars/USE_HTTPS_FROM_S3
  chown -R ubuntu $ec2UserHome/vars

  echo -e "$arrow done"
fi

# |4|

echo "Verifying AWS CLI is installed..."
if ! command -v aws &> /dev/null; then
  echo "Error: AWS CLI command (aws) could not be found"
  exit 1
else
  echo -e "$arrow installed"
fi

# |5|

echo "Checking AWS credentials can access S3..."
set +e
aws s3 ls 1> /dev/null
exitCodeAwsS3Ls=$?
if [[ $exitCodeAwsS3Ls -ne 0 ]]; then
  echo "Error: AWS credentials failed to access S3 with code: $exitCodeAwsS3Ls"
  echo -e "$arrow Run$cyan aws configure$color_reset to set credentials for AWS CLI"
  exit 1
else
  echo -e "$arrow AWS credentials can access S3"
fi
set -e

# |7|

echo "Checking for secure-certificates bucket..."
bucketName=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `secure-certificates-`) == `true`].[Name]' \
  --output text \
  | head -n 1)

# |8|

if [[ -z $bucketName ]]; then
  echo "Error: secure-certificates bucket not found"
  exit 1
fi

echo -e "$arrow found"

# |9|

appHostname='REPLACE_WITH_HOSTNAME'
echo "Checking certificate and key exists for $appHostname..."
set +e

certHead=$(aws s3api head-object \
  --bucket $bucketName \
  --key $appHostname/fullchain.pem 2> /dev/null)
keyHead=$(aws s3api head-object \
  --bucket $bucketName \
  --key $appHostname/privkey.pem 2> /dev/null)

set -e
if [[ -z $certHead || -z $keyHead ]]; then
  echo "Error: cert and key for $appHostname not both found"
  exit 1
fi

echo -e "$arrow both found"

# |10|

echo "Downloading cert and key to $ec2UserHome/server/.certificates/..."

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

# |11|

if [[ ! -d /etc/letsencrypt/live/$appHostname ]]; then
  echo "Hard linking to /etc/letsencrypt/live/$appHostname/ to support certbot renew..."

  mkdir -p /etc/letsencrypt/live/$appHostname
  
  ln \
    $ec2UserHome/server/.certificates/fullchain.pem \
    /etc/letsencrypt/live/$appHostname/fullchain.pem
  
  ln \
    $ec2UserHome/server/.certificates/privkey.pem \
    /etc/letsencrypt/live/$appHostname/privkey.pem
fi

# |12|

echo "Installing aws-cfn-bootstrap..."
apt install -y --no-install-recommends python3-pip
pip install https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-py3-latest.tar.gz
[[ ! -f /usr/lib/systemd/system/cfn-hup ]] && ln -s /usr/local/init/ubuntu/cfn-hup /usr/lib/systemd/system/cfn-hup

echo "Send cfn-signal..."
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`
HEADER="X-aws-ec2-metadata-token: $TOKEN"
MURL="-v http://169.254.169.254/latest/meta-data/"
IID=$(curl -H "$HEADER" ${MURL}instance-id)
REGION=$(curl -H "$HEADER" ${MURL}placement/region)
PLID=$(aws ec2 describe-instances --region $REGION --instance-ids $IID --query 'Reservations[].Instances[].Tags[?Key==`PipelineLogicalID`].Value' --output text | head -n 1)
STACK=$(aws ec2 describe-instances --region $REGION --instance-ids $IID --query 'Reservations[].Instances[].Tags[?Key==`Stack`].Value' --output text | head -n 1)
/usr/local/bin/cfn-signal\
  --success true\
  --region $REGION\
  --resource $PLID\
  --stack $STACK
