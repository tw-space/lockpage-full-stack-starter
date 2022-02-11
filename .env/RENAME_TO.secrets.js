//
//  .secrets.js
//  Secrets for development and testing ONLY
//
//  For production secrets on AWS, put these parameters into SSM Parameter Store
//  via the AWS CLI (must be configured)
//
//  For example to put jwtSubMain into SSM Parameter Store:
//    $ aws ssm put-parameter \
//      --name "/my-app/prod/jwtSubMain" \
//      --value "parameter-value" \
//      --type "SecureString"
//
//  To verify the parameter:
//    $ aws ssm get-parameters \
//      --name "/my-app/prod/jwtSubMain" \
//      --with-decryption
//
//  To verify all parameters under path:
//    $ aws ssm get-parameters-by-path \
//      --path "/my-app/prod/" \
//      --recursive
//      --with-decryption
//
//  To change the parameter:
//    $ aws ssm put-parameter \
//        --name "/my-app/prod/jwtSubMain" \
//        --value "new-parameter-value" \
//        --type "SecureString" \
//        --overwrite
//
const jwtAud = 'your domain name'
const jwtIss = 'your domain name'
const jwtSubGuest = 'jwtSubGuest secret'
const jwtSubMain = 'jwtSubMain secret'
const rootPwd = '.' // absolute path to local project dir for dev and testing
const secretCookie = 'secretCookie secret'
const secretJWT = 'secretJWT secret'
const secretKeyGuest = 'guest secret'
const secretKeyMain = 'main secret'
const useHttpsLocal = '0'

module.exports = {
  jwtAud,
  jwtIss,
  jwtSubGuest,
  jwtSubMain,
  rootPwd,
  secretCookie,
  secretJWT,
  secretKeyGuest,
  secretKeyMain,
  useHttpsLocal,
}
