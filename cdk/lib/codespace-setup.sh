#!/bin/bash
###############################################################################
# 
#     Run script with "dot space syntax" when local:
#     $ . /path/to/codespace-setup.sh
#
#     Or from github, install better wget, then run with wget:
#     $ apt update -y && \
#       apt install -y wget
#     $ sh -c "$(wget https://raw.github.com/...sh -O -)"
#
###############################################################################

# send stdout and stderr to logs file
exec &> >(tee -a /var/log/codespace-setup.log)

# echo every command
set -x

# setup on ubuntu 20.x
export OS_NAME=ubuntu

# Configure home, user, and working dir
export ZUSER=ubuntu
adduser $ZUSER                # fails if exists
export ZHOME=/home/$ZUSER
export HOME=/home/$ZUSER      # needed for zsh install
export CODESPACE=codespace
export RUSER=root
export RHOME=/root

# stop script when first command fails
set -e

# Install codedeploy agent dependencies
echo "Installing dependencies for codedeploy agent..." \
 && apt update -y \
 && apt install -y --no-install-recommends \
      awscli \
      ruby-full \
      wget

# Install codedeploy agent
cd $ZHOME
wget https://aws-codedeploy-us-west-2.s3.us-west-2.amazonaws.com/latest/install
chmod +x ./install
./install auto \
  && rm -f ./install

#
# Configure codedeploy agent to run as non-root
#
service codedeploy-agent stop
# configure codedeploy process to run as ZUSER
sed -i "s/\"\"/\"${ZUSER}\"/g" /etc/init.d/codedeploy-agent
if [ -e /etc/init.d/codedeploy-agent.service ]; then
  if [ ! -e /lib/systemd/system/codedeploy-agent.service ] && [ ! -e /usr/lib/systemd/system/codedeploy-agent.service ]; then
    # move CodeDeploy service file to a correct systemd directory
    mv /etc/init.d/codedeploy-agent.service /usr/lib/systemd/system/
  else 
    # CodeDeploy service file found in both /etc/init.d and a correct systemd directory -- removing /etc/init.d one
    rm -f /etc/init.d/codedeploy-agent.service
  fi
fi
sed -i "s/#User=codedeploy/User=${ZUSER}/g" /usr/lib/systemd/system/codedeploy-agent.service
systemctl daemon-reload
chown $ZUSER:$ZUSER -R /opt/codedeploy-agent/
chown $ZUSER:$ZUSER -R /var/log/aws/
systemctl enable codedeploy-agent
service codedeploy-agent start

# Install packages for codespace
echo "Installing packages for codespace..." \
 && apt update -y \
 && apt install -y --no-install-recommends \
      bash \
      ca-certificates \
      coreutils \
      curl \
      fd-find \
      git \
      locales \
      ncurses-base \
      neovim \
      rename \
      ripgrep \
      tmux \
      tree \
      util-linux \
      zsh \
 && apt clean -y \
 && rm -rf /var/lib/apt/lists/*

# Fix locale issues, e.g. with Perl
sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
 && dpkg-reconfigure --frontend=noninteractive locales \
 && update-locale LANG=en_US.UTF-8
export LANG=en_US.UTF-8 

# Clone dotfiles from public repo
git clone https://github.com/tw-space/dotfiles $ZHOME/.dotfiles

# Install oh-my-zsh
export ZSH=$ZHOME/.oh-my-zsh
export RZSH=$RHOME/.oh-my-zsh
export SHELL=/bin/zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
cp -r $ZSH $RZSH
\cp -f $ZHOME/.dotfiles/zsh/.zshrc $ZHOME/
\cp -f $ZHOME/.dotfiles/zsh/.zshrc $RHOME/
cp $ZHOME/.dotfiles/zsh/codespace.zsh-theme $ZSH/themes/
cp $ZHOME/.dotfiles/zsh/codespace256.zsh-theme $ZSH/themes/
cp $ZHOME/.dotfiles/zsh/codespace-rt.zsh-theme $RZSH/themes/
cp $ZHOME/.dotfiles/zsh/codespace256-rt.zsh-theme $RZSH/themes/
git clone https://github.com/jocelynmallon/zshmarks $ZSH/custom/plugins/zshmarks
cp -r $ZSH/custom/plugins/zshmarks $RZSH/custom/plugins/zshmarks

# Install fzf from git
git clone --depth 1 https://github.com/junegunn/fzf.git $ZHOME/.fzf
cp -r $ZHOME/.fzf $RHOME/.fzf
$ZHOME/.fzf/install --all || true
rm -f $ZHOME/.bashrc $ZHOME/.fzf/code.bash
rm -f $RHOME/.bashrc $RHOME/.fzf.bash

# Configure neovim
mkdir -p $ZHOME/.config/nvim/colors \
 && mkdir -p $ZHOME/.local/share/nvim/site/autoload \
 && cp $ZHOME/.dotfiles/neovim/init-ec2.vim $ZHOME/.config/nvim/init.vim \
 && cp $ZHOME/.dotfiles/neovim/monokai-fusion.vim $ZHOME/.config/nvim/colors/ \
 && cp $ZHOME/.dotfiles/neovim/plug.vim $ZHOME/.local/share/nvim/site/autoload/ \
 && cp $ZHOME/.dotfiles/neovim/dracula-airline.vim $ZHOME/.config/nvim/dracula.vim \
 && cp $ZHOME/.dotfiles/neovim/dracula.vim $ZHOME/.config/nvim/colors/
mkdir -p $RHOME/.config/nvim/colors \
 && mkdir -p $RHOME/.local/share/nvim/site/autoload \
 && cp $ZHOME/.dotfiles/neovim/init.vim $RHOME/.config/nvim/ \
 && cp $ZHOME/.dotfiles/neovim/monokai-fusion.vim $RHOME/.config/nvim/colors/ \
 && cp $ZHOME/.dotfiles/neovim/plug.vim $RHOME/.local/share/nvim/site/autoload/ \
 && cp $ZHOME/.dotfiles/neovim/dracula-airline.vim $RHOME/.config/nvim/dracula.vim \
 && cp $ZHOME/.dotfiles/neovim/dracula.vim $RHOME/.config/nvim/colors/
nvim --headless +PlugInstall +qall

# Configure tmux
cp $ZHOME/.dotfiles/tmux/.tmux.conf $ZHOME/
cp $ZHOME/.dotfiles/tmux/.tmux.conf $RHOME/
git clone https://github.com/tmux-plugins/tpm $ZHOME/.tmux/plugins/tpm
cp -r $ZHOME/.tmux $RHOME/.tmux
tmux start-server \
 && tmux new-session -d \
 && sleep 1 \
 && $ZHOME/.tmux/plugins/tpm/scripts/install_plugins.sh \
 && tmux kill-server
mkdir -p $ZHOME/.tmux/scripts \
 && cp -r $ZHOME/.dotfiles/tmux/scripts $ZHOME/.tmux/
mkdir -p $RHOME/.tmux/scripts \
 && cp -r $ZHOME/.dotfiles/tmux/scripts $RHOME/.tmux/

# Set default shell for user
usermod --shell /bin/zsh $ZUSER
usermod --shell /bin/zsh $RUSER

# Cleanup
rm -rf $ZHOME/.dotfiles

# Make codespace
mkdir $ZHOME/$CODESPACE
mkdir $RHOME/$CODESPACE

# Give user their stuff
chown -R $ZUSER $ZHOME

# Apply targeted security measures
chmod 0755 /usr/bin/pkexec    # CVE-2021-4034

# Start zsh in codespace
# if [[ $USER == 'root' ]]; then
#   cd $RHOME/$CODESPACE
# else
#   cd $ZHOME/$CODESPACE
# fi
# zsh

