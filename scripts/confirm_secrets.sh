#!/bin/bash
#
# confirm_secrets.sh
# run with 'yarn secrets:confirm'

set -e

# |1| Prepare formatting variables
# colors
blue="\033[0;34m"
color_reset="\033[0m"
cyan="\033[0;36m"
red="\033[0;31m"
# content
arrow="\xE2\x86\x92"
error="error"
info="info"

# |2| Confirm .env directory
if [[ -d .env ]]; then
  BASEDIR_PWD=$(pwd)
else
  echo -e "$red$error$color_reset .env directory not found. Run script with$cyan yarn secrets:confirm$color_reset"
  exit 1
fi

# rename secrets file if not already renamed
if [[ -f .env/.secrets.js ]]; then
  : # echo "Found .env/.secrets.js"
elif [[ -f .env/.production.secrets.js ]]; then
  : # echo "Found .env/.production.secrets.js"
elif [[ -f .env/RENAME_TO.secrets.js ]]; then
  echo "Copying .env/RENAME_TO.secrets.js to .env/.secrets.js..."
  cp .env/RENAME_TO.secrets.js .env/.secrets.js
  echo "Setting rootPwd secret to project path..."
  perl -i -pe"s{rootPwd = ''}{rootPwd = '$BASEDIR_PWD'}g" .env/.secrets.js
else
  echo -e "$red$error$color_reset No secrets files found in .env/"
  exit 1
fi
