#!/bin/zsh
#
# create-lockpage-app.zsh
# (runs with zsh or bash)

set -e

# Set colorize variables in zsh or bash
if [ -n "$ZSH_VERSION" ]; then
  red="\e[1;31m"
  green="\e[1;32m"
  yellow="\e[1;33m"
  cyan="\e[1;36m"
  white="\e[1;37m"
  color_reset="\e[0m"
elif [ -n "$BASH_VERSION" ]; then
  red="\033[0;31m"
  green="\033[0;32m"
  yellow="\033[0;33m"
  cyan="\033[0;36m"
  white="\033[0;37m"
  color_reset="\033[0m"
else
  echo "Run with zsh or bash to continue"
  exit 1
fi

# Verify dependencies
if ! command -v rename &> /dev/null; then
  echo -e "Install$cyan rename$color_reset package to continue";
  exit 1;
fi

# Get project name
NAME="my-app";
if [[ -z "$1" ]]; then
  echo -ne "$cyan?$color_reset What is your project named?$cyan (my-app)$color_reset  "
  if [ -n "$ZSH_VERSION" ]; then
    read "project_name?"
  elif [ -n "$BASH_VERSION" ]; then
    read project_name
  fi
  # read "project_name?$cyan?$color_reset What is your project named? $cyan (my-app)$color_reset  ";
  if [[ ! -z "$project_name" ]]; then
    NAME="$project_name";
  fi
  if [[ "$project_name" =~ " " ]]; then
    echo "Error: Name cannot include whitespace"
    exit 1
  fi
else
  NAME="$1";
fi

# Clone starter into project directory
echo ""
mkdir "$NAME"
cd "$NAME"
if [[ -z OVERRIDE_STARTER_REPO ]]; then
  git clone https://github.com/tw-space/lockpage-full-stack-starter .
else
  git clone --branch "${OVERRIDE_STARTER_BRANCH:=master}" "$OVERRIDE_STARTER_REPO" .
fi
rm -rf .git
git init

# Prepare underscored version of NAME for database variables
UNDERSCORED_NAME=${NAME//-/_}

# Configure starter with project's name
perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" package.json\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" appspec.yml\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" scripts/start_server.sh\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" scripts/populate_secrets.sh\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" scripts/populate_secrets.node.js\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" scripts/db_prod_migrate.sh\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" .env/production.env.js\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" .env/test.env.js\
&& perl -i -pe"s/lockpage\-full\-stack\-starter/$NAME/g" cdk/my-app-cdk/user-data/setup-codespace.sh\
&& perl -i -pe"s/lockpage\-full\-stack\-starter[-a-z]*/$NAME/g" .github/workflows/run-PR-tests.yml\
&& perl -i -pe"s/my\-app/$NAME/g" .env/common.env.js\
&& perl -i -pe"s/my\-app/$NAME/g" .env/RENAME_TO.secrets.js\
&& perl -i -pe"s/my\-app/$NAME/g" cdk/my-app-cdk/package.json\
&& perl -i -pe"s/my\-app/$NAME/g" cdk/my-app-cdk/cdk.json\
&& perl -i -pe"s/my\-app/$NAME/g" cdk/my-app-cdk/.env/RENAME_TO.secrets.js\
&& perl -i -pe"s/my\-app/$NAME/g" cdk/my-app-cdk/lib/my-app-cdk-stack.ts\
&& perl -i -pe"s/my\-app/$NAME/g" cdk/my-app-cdk/bin/my-app-cdk.ts\
&& perl -i -pe"s/my\-app/$NAME/g" cdk/my-app-cdk/scripts/stack-precheck.sh\
&& perl -i -pe"s/my\-app/$NAME/g" db/docker/docker-compose-dev-fw-pg.yml\
&& perl -i -pe"s/my\-app/$NAME/g" db/docker/docker-compose-prod-flyway.yml\
&& perl -i -pe"s/my_app/$UNDERSCORED_NAME/g" .env/test.env.js\
&& perl -i -pe"s/my_app/$UNDERSCORED_NAME/g" .env/development.env.js\
&& perl -i -pe"s/my_app/$UNDERSCORED_NAME/g" .env/RENAME_TO.secrets.js\
&& perl -i -pe"s/my_app/$UNDERSCORED_NAME/g" scripts/populate_secrets_test_gh.node.js\
&& perl -i -pe"s/my_app/$UNDERSCORED_NAME/g" cdk/my-app-cdk/.env/RENAME_TO.secrets.js\
&& cd cdk/my-app-cdk\
&& rename "s/my\-app/$NAME/g" lib/my-app-cdk-stack.ts\
&& perl -i -pe"s/my\-app/$NAME/g" bin/my-app-cdk.ts\
&& rename "s/my\-app/$NAME/g" bin/my-app-cdk.ts\
&& rename "s/my\-app/$NAME/g" test/my-app-cdk.test.ts\
&& perl -i -pe"s/my_app/$UNDERSCORED_NAME/g" .env/RENAME_TO.secrets.js\
&& cd ../..\
&& rename "s/my\-app/$NAME/g" cdk/my-app-cdk\
&& perl -i -pe"s/my\-app/$NAME/g" README.md\
&& perl -i -pe"s/my\-app/$NAME/g" CHANGELOG.md\
&& echo ""\
&& echo -e "Successfully created app $green$NAME$color_reset from$cyan lockpage-full-stack-starter$color_reset"\
&& echo ""\
&& echo -e "See$white README.md$color_reset for next steps"\
&& echo ""
