#!/bin/bash

# exit on first fail and echo commands
set -ex

# send stdout and stderr to logs file
mkdir -p ~/log
exec &> >(tee -a ~/log/codedeploy-start_server.log)

# manually update PATH to call yarn and pm2 properly
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
echo $PATH | grep "$(yarn global bin)" || export PATH=$PATH:$(yarn global bin)

# configure pm2 with log-rotate
pm2 install pm2-logrotate

# start app with yarn script
cd ~/server/lockpage-full-stack-starter
yarn serve
