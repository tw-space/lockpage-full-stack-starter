#!/bin/bash
#
# install-aws.sh

# |0| Send logs to file and stdout; exit on error
set -e
exec &> >(tee -a /var/log/install-aws.log)

# |1| Install awscli and related packages
apt update -y
apt install -y git awscli ec2-instance-connect groff less

# |2| Clone aws linux utilities (including cfn)
cd /lib
until git clone https://github.com/aws-quickstart/quickstart-linux-utilities.git
do
  echo "Retrying"
done

# |3| Run quickstart scripts
cd /lib/quickstart-linux-utilities
source quickstart-cfn-tools.source
qs_update-os || qs_err
qs_bootstrap_pip || qs_err
qs_aws-cfn-bootstrap || qs_err
mkdir -p /opt/aws/bin
ln -s /usr/local/bin/cfn-* /opt/aws/bin/
