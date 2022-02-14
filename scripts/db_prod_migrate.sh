#!/bin/zsh
#
# db_prod_migrate.sh

# send stdout and stderr to logs file; enable errexit
set -e # enable errexit
set -x # enable xtrace
mkdir -p ~/log
exec > >(tee -a ~/log/db_prod_migrate.log) 2>&1
echo "[$(date)]"

# source ec2env values
[[ -s ~/.ec2env ]] && source ~/.ec2env

# run flyway migrate via docker-compose
cd /home/ubuntu/server/lockpage-full-stack-starter &> /dev/null
yarn db:prod:migrate
