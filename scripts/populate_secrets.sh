#!/bin/zsh
#
# populate_secrets.sh

# exit on first fail and echo commands
set -ex

# send stdout and stderr to logs file
mkdir -p ~/log
exec > >(tee -a ~/log/codedeploy-populate_secrets.log) 2>&1
echo "[$(date)]"

# source ec2env
[[ -s ~/.ec2env ]] && source ~/.ec2env

# configure pm2 with log-rotate
pm2 install pm2-logrotate

# populate production secrets from SSM Parameter Store
cd ~/server/lockpage-full-stack-starter
yarn
yarn cache clean
yarn script:secrets
