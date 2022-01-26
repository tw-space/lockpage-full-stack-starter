#!/bin/bash

# exit on first fail and echo commands
set -ex

# send stdout and stderr to logs file
mkdir -p ~/log
exec &> >(tee -a ~/log/codedeploy-install_dependencies.log)

# Install and activate nvm, then install node lts
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install --lts

# Manually add nvm startup calls to zshrc
grep -qxF 'export NVM_DIR="$HOME/.nvm"' ~/.zshrc || \
echo '
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
' >> ~/.zshrc

# Install yarn and pm2 globally with npm
npm install -g yarn
yarn global add pm2
grep -qxF 'export PATH=$PATH:$(yarn global bin)' ~/.zshrc || \
echo '
export PATH=$PATH:$(yarn global bin)

typeset -aU path    # dedupes path
' >> ~/.zshrc

# Ubuntu: use setcap (libcap2-bin) to allow node to open ports <1024
sudo setcap cap_net_bind_service=+ep $(which node)
