#!/bin/bash
#
# setup-codespace.sh

exec 3>&1; exec 4>&1
exec > >(tee -a /var/log/setup-codespace.log) 2>&1
echo "[$(date)]"
set -x

# Configure home, user, and working dir
export OS_NAME=ubuntu
export ZUSER=ubuntu
adduser $ZUSER                # fails if exists
export ZHOME=/home/$ZUSER
export HOME=/home/$ZUSER      # needed for zsh install
export CODESPACE=codespace
export RUSER=root
export RHOME=/root

set -e

echo "Installing packages for codespace..." \
 && apt update -y \
 && apt install -y --no-install-recommends \
      fd-find \
      locales \
      neovim \
      rename \
      ripgrep \
      tree \
      util-linux \
      zsh

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

###
##
# Setup aws & codedeploy

# Logs
exec >&3
exec > >(tee -a /var/log/setup-codedeploy.log) 2>&1
echo "[$(date)]"

# Install codedeploy agent dependencies
echo "Installing dependencies for aws & codedeploy agent..." \
 && apt install -y --no-install-recommends \
      awscli \
      groff \
      ruby-full

# Install codedeploy agent
echo "Installing codedeploy agent..."
cd $ZHOME
wget https://aws-codedeploy-us-west-2.s3.us-west-2.amazonaws.com/latest/install
chmod +x ./install
./install auto \
 && rm -f ./install

# Configure codedeploy agent to run as non-root
echo "Customizing and restarting codedeploy agent service..."
service codedeploy-agent stop
# run as ZUSER
sed -i "s/\"\"/\"${ZUSER}\"/g" /etc/init.d/codedeploy-agent
if [ -e /etc/init.d/codedeploy-agent.service ]; then
  if [ ! -e /lib/systemd/system/codedeploy-agent.service ] && [ ! -e /usr/lib/systemd/system/codedeploy-agent.service ]; then
    # move to correct systemd directory
    mv /etc/init.d/codedeploy-agent.service /usr/lib/systemd/system/
  else 
    # Remove redundant
    rm -f /etc/init.d/codedeploy-agent.service
  fi
fi
sed -i "s/#User=codedeploy/User=${ZUSER}/g" /usr/lib/systemd/system/codedeploy-agent.service
systemctl daemon-reload
chown $ZUSER:$ZUSER -R /opt/codedeploy-agent/
chown $ZUSER:$ZUSER -R /var/log/aws/
systemctl enable codedeploy-agent
service codedeploy-agent start

###
##
# Setup swapspace

# |0| Logs
exec >&4
exec > >(tee -a /var/log/setup-swapspace.log) 2>&1
echo "[$(date)]"

# |1| Create swap space
swapShow=$(sudo swapon --show)
if [[ -z $swapShow ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
fi

# |2| Persist through reboots
if [[ ! -f /etc/fstab.bak ]]; then
  cp /etc/fstab /etc/fstab.bak # backup
  echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
fi

# |3| Configure swappiness
sysctl vm.swappiness=10 # default 60
grep -q 'vm.swappiness=10' /etc/sysctl.conf || echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf

# |4| Configure cache pressure
sysctl vm.vfs_cache_pressure=50 # default 100
grep -q 'vm.vfs_cache_pressure=50' /etc/sysctl.conf || echo 'vm.vfs_cache_pressure=50' | tee -a /etc/sysctl.conf
