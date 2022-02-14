//
//  .secrets.js
//  Secrets for development and testing ONLY
//
//  For PRODUCTION secrets on AWS, put these parameters into SSM Parameter Store
//  via the AWS CLI (must be configured)
//
//  Important: Parameter names must begin with SSM_PATH environment variable's
//             value, set in .env/common.env.js (default: '/my-app/prod/')
//
//  For example to put jwtSubMain into SSM Parameter Store:
//    $ aws ssm put-parameter \
//      --name '/my-app/prod/jwtSubMain' \
//      --value 'parameter-value' \
//      --type 'SecureString'
//
//  To verify the parameter:
//    $ aws ssm get-parameters \
//      --name '/my-app/prod/jwtSubMain' \
//      --with-decryption
//
//  To verify all parameters under path:
//    $ aws ssm get-parameters-by-path \
//      --path '/my-app/prod/' \
//      --recursive
//      --with-decryption
//
//  To change the parameter:
//    $ aws ssm put-parameter \
//      --name '/my-app/prod/jwtSubMain' \
//      --value 'new-parameter-value' \
//      --type 'SecureString' \
//      --overwrite

// ADD these to SSM Parameter Store (local and prod values can differ):
const jwtAud = 'localhost'
const jwtIss = 'localhost'
const jwtSubGuest = 'jwtSubGuest secret'
const jwtSubMain = 'jwtSubMain secret'
const secretCookie = 'secretCookie secret'
const secretJWT = 'secretJWT secret'
const secretKeyGuest = 'guest secret'
const secretKeyMain = 'main secret'

// ALSO ADD these to SSM parameter store:
//
//   /my-app/prod/dbProdDatabaseName  (e.g. 'my_app_db')
//   /my-app/prod/dbProdPassword      (your database password)
//   /my-app/prod/dbProdPort          (e.g. '5432')
//   /my-app/prod/dbProdUser          (e.g. 'my_app_user')

// DON'T add these to SSM parameter store:
const dbDevPassword = 'change_this_password_right_away!'
const ghaRepoName = '' // only set if repo name different from app name
const rootPwd = '' // absolute path to local project dir for dev and testing
const useHttpsFromS3 = '0'
const useHttpsLocal = '0'

module.exports = {
  dbDevPassword,
  ghaRepoName,
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyGuest,
  secretKeyMain,
  useHttpsFromS3,
  useHttpsLocal,
}
