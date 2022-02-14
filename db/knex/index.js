//
// knex / index.js
//
let env = process.env.TRUE_ENV || 'development'
env = env.replace('-hot', '')
const config = require('../conf/knexfile')[env]

module.exports = require('knex')(config)
