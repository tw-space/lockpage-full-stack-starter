/* eslint key-spacing: ["error", { "mode": "minimum", "align": "value" }],  */
//
// knexfile.js
//
module.exports = {

  development: {
    client:     'pg',
    version:    '12.9',
    connection: {
      database: process.env.DB_DEV_DATABASE_NAME,
      host:     'localhost',
      password: process.env.DB_DEV_PASSWORD,
      port:     process.env.DB_DEV_PORT,
      user:     process.env.DB_DEV_USER,
    },
    pool: {
      min: 1,
      max: 5,
    },
    searchPath: ['public'],
  },

  test: {
    client:     'pg',
    version:    '12.9',
    connection: {
      database: process.env.DB_DEV_DATABASE_NAME,
      host:     'localhost',
      password: process.env.DB_DEV_PASSWORD,
      port:     process.env.DB_DEV_PORT,
      user:     process.env.DB_DEV_USER,
    },
    pool: {
      min: 1,
      max: 10,
    },
    searchPath: ['public'],
  },

  production: {
    client:     'pg',
    version:    '12.9',
    connection: {
      database: process.env.DB_PROD_DATABASE_NAME,
      host:     process.env.DB_PROD_HOST,
      password: process.env.DB_PROD_PASSWORD,
      port:     process.env.DB_PROD_PORT,
      user:     process.env.DB_PROD_USER,
    },
    pool: {
      min: 2,
      max: 10,
    },
    searchPath: ['public'],
  },
  
  // staging: {
  //   client:     'pg',
  //   version:    '12.9',
  //   connection: {
  //     database: process.env.DB_DATABASE_NAME,
  //     host:     'localhost',
  //     password: process.env.DB_PASSWORD,
  //     port:     process.env.DB_PORT,
  //     user:     process.env.DB_USER,
  //   },
  //   pool: {
  //     min: 1,
  //     max: 1,
  //   },
  //   searchPath: ['public'],
  // },
}

// Alternatively, could be exported async:
// async function fetchConfiguration() {
//   // implement me
//   return {
//     client: 'pg',
//     connection: { user: 'me', password: 'my_pass' },
//   }
// }

// module.exports = async () => {
//   const configuration = await fetchConfiguration()
//   return {
//     ...configuration,
//     migrations: {},
//   }
// }
