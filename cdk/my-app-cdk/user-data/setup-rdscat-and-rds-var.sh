#!/bin/bash
#
# setup-rdscat-and-rds-var.sh

# |1| Configure and start rdscat service

# send stdout and stderr to logs file
set -ex
exec > >(tee -a /var/log/setup-rdscat-and-rds-var.log) 2>&1

# Install socat
echo "Installing dependencies for rds connection..." \
 && apt update -y \
 && apt install -y --no-install-recommends \
      socat

# Configure rds connection service
echo "Configuring rds connection service..."
export RDSPATH=/usr/lib/systemd/system/rdscat.service
touch ${RDSPATH}
chmod 644 ${RDSPATH}
cat <<EOF >${RDSPATH}
[Unit]
Description=Port Forwarding to RDS
After=network.target
StartLimitIntervalSec=0

[Service]
Type=Simple
Restart=always
RestartSec=1
User=root
ExecStart=/usr/bin/socat tcp-l:PORT,reuseaddr,fork tcp4:ENDPOINT

[Install]
WantedBy=multi-user.target
EOF

# Start rds connection service
echo "Starting rds connection service..."
systemctl daemon-reload
systemctl enable rdscat
service rdscat start

# |2| Write RDS instance endpoint to var

ec2UserHome=/home/ubuntu
mkdir -p $ec2UserHome/vars
touch $ec2UserHome/vars/DB_PROD_HOST
echo "ENDPOINT" > $ec2UserHome/vars/DB_PROD_HOST
chown -R ubuntu $ec2UserHome/vars 
