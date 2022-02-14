#!/bin/bash
#
# db_prod_connect_psql.sh

# Requires first installing postgresql (apt install postgresql)
# Run with yarn db:prod:connect:psql
PGPASSWORD=$DB_PROD_PASSWORD psql -U $DB_PROD_USER -h localhost -p $DB_PROD_PORT -d $DB_PROD_DATABASE_NAME