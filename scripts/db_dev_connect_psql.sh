#!/bin/bash
#
# db_dev_connect_psql.sh

# Requires postgres container to be running (yarn db:dev:setup)
PGPASSWORD=$DB_DEV_PASSWORD psql -U $DB_DEV_USER -h localhost -p $DB_DEV_PORT -d $DB_DEV_DATABASE_NAME
