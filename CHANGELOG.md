# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.1.5 — Fixes to Create App Script (2022-04-05)

This release adds **fixes** to the **create-lockpage-app** script.

### Adds

* Conversion of `MyApp` to pascal cased transformation of app name in *create-lockpage-app* script
* Third party notice for this starter in `THIRD_PARTY_NOTICES.md`
* `CHANGELOG_NEW.md` with empty changelog which is renamed to `CHANGELOG.md` at create
* Automatic copying of `RENAME_TO.secrets.js` to `.secrets.js` files
* Populates `rootPwd` in `.secrets.js`

### Changes

* Defaults `version` to `0.0.0` in `package.json` after create
* Defaults `license` to `UNLICENSED` in `package.json` after create
* Removes `LICENSE` file after create
* Clears `description` field in `package.json` after create
* Removes `repository` info from `package.json` after create
* Improves `README`
* Improves preparations for `create-certs-cdk` stack after create

## 0.1.4 — CI Pipeline (2022-03-11)

This release adds **Continuous Integration** into the CodePipeline.

### Adds

* Generated unique S3 artifact bucket name to be reused by subsequent runs of CodePipeline
* Fixes to create-lockpage-app script
* Scripts to simplify project setup (dev:setup, db:dev:setup)
* Simplified https local setup via https:local:setup script
* CodePipeline dependency on ec2 creation in cdk script

## 0.1.3 — Database (2022-03-03)

The focus for this release is adding a **database**.

### Adds

* Amazon RDS PostgreSQL instance (t2.micro, free tier) in vpc via app CDK stack
* Database migrations run with Flyway via Docker Compose
* Docker Compose scripts which spin up Postgres and Flyway containers and run Flyway migrate on SQL migration files to populate database (see `yarn db:` scripts). Configurations adapted for local development, PR tests in GitHub Actions, and deployment to AWS via the CDK stack.
* Knex.js library for low-level access to database
* Objection.js library, an abstraction layer built on Knex.js, for building and interacting with data models
* Ability to connect to RDS PostgreSQL instance remotely via port forwarding through the EC2 instance with *socat* (use `yarn db:prod:connect:psql`)
* Minimal front-end example under *_main* which pulls "Famous People" from database with Server-Side Rendering (images fetched client-side in prototype style; *later:* store images in S3)
* Database tests (`yarn jest:db`)
* Model tests (`yarn jest:models`)
* Support for also running database and model PR tests in GitHub Actions workflow using Docker Compose when creating a Pull Request into master
* Separate standalone CDK stack which spins up a temporary EC2 instance, associates it with a Route 53 alias record for a domain name you own, requests a free HTTPS (TLS) certificate and key from Let's Encrypt, and stores them in a private S3 bucket. Also adds script prechecks when synthesizing the stack to give guidance and avoid duplications. Run `yarn cdk:full` in *cdk/create-certs* to get started.
* Configurability in the app CDK EC2 instance to use the certificate and key stored in S3 to serve via properly signed HTTPS (set `CDK_` environment variables in `cdk/my-app-cdk/.env/.secrets.js`)
* Script to check for and give guidance on setting up local HTTPS when testing and serving the full built project locally including the lockpage (see `yarn https:local:setup`)
* Better logging for EC2 user data and CodeDeploy scripts. Find user data logs in */var/log* and CodeDeploy logs in *~/log* on the EC2 instance.

### Changes

* EC2 Auto Scaling group and load balancer changed to EC2 instance in app cdk (to ensure EC2 and RDS single instances are placed in same availability zone, thus avoiding data transfer costs across AZs)

## 0.1.2 — Feature Flags (2022-02-12)

This release adds support for **feature flags**.

### Adds

* Helpers for **feature flags**. Details in *README*.

## 0.1.1 — PR tests (2022-02-12)

This release adds support for **PR tests** in GitHub via a GitHub Actions workflow.

### Adds

* GitHub Actions workflow that triggers PR tests to run on creating a new Pull Request into *master*

## 0.1.0 — First Release (2022-01-26)

First public release of this starter. See *README* for details.

### Adds

* AWS CDK stack which quickly deploys your project to a domain name you own. The stack creates:
  * Elastic Application Load Balancer configured to listen with an HTTPS certificate you own and store in AWS Certificate Manager (free to create)
  * EC2 Auto Scaling Group configured to create one instance which only allows inbound traffic from the load balancer
  * Route 53 Alias Record which directs traffic for your owned domain name to the load balancer
  * CodePipeline which Continuously Deploys changes to your GitHub repository via CodeDeploy
* Next.js starter protected behind a "lockpage" — a static password protection page interacting with a custom Express server and Next.js middleware which can authorize access to different variants of your project for different passwords. Uses JSON Web Tokens and secure cookies for authorization. 
* Comprehensive *Jest* unit tests for client and server (uses *Testing Library*, *Mock Service Worker*, and *supertest*)
* Support for styling with *Stitches*
* Script to create new projects from this starter template with a given app name
* Lots of *yarn* scripts in *package.json* to automate tasks and configurations
