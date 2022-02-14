//
// models / FamousPeople.js
//
const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class FamousPeople extends Model {
  static get tableName() {
    return 'famous_people'
  }

  static get idColumn() {
    return 'famous_person_id'
  }
}

module.exports = FamousPeople
