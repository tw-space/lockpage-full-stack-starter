#!/bin/zsh
#
# start_server.sh

# exit on first fail and echo commands
set -ex

# send stdout and stderr to logs file
mkdir -p ~/log
exec > >(tee -a ~/log/start_server.log) 2>&1
echo "[$(date)]"

# source ec2env values
[[ -s ~/.ec2env ]] && source ~/.ec2env

# Ubuntu: use setcap (libcap2-bin) to allow node to open ports <1024
sudo setcap cap_net_bind_service=+ep $(command -v node)

# configure pm2 with log-rotate
pm2 install pm2-logrotate

# start app with yarn script
cd ~/server/lockpage-full-stack-starter
yarn serve
yarn cache clean
