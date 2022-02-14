/* eslint-disable */
//
// famous_people_table_columns.test.js
// Test famous_people table columns
//
const knex = require('../knex')

describe('famous_people table', () => {
  
  // Set up test suite
  
  const schemaName = 'public'
  const tableName = 'famous_people'

  afterAll(() => {
    knex.destroy()
  })

  it('should exist in schema "public"', () => {
    return expect(knex.schema.withSchema(schemaName).hasTable(tableName)).resolves.toBeTrue()
  })

  describe('columns', () => {

    let columnInfo
    
    beforeAll(async () => {
      columnInfo = await knex(tableName).columnInfo()
    })

    it('should have column "famous_person_id"', () => {
      expect(Object.keys(columnInfo)).toContain('famous_person_id')
    })

    it('should have column "display_name"', () => {
      expect(Object.keys(columnInfo)).toContain('display_name')
    })

    describe('famous_person_id column', () => {

      const famousPersonId = 'famous_person_id'

      it('should be type integer', () => {
        expect(columnInfo[famousPersonId].type).toEqual('integer')
      })

      it('should have no max length', () => {
        expect(columnInfo[famousPersonId].maxLength).toBeNull()
      })

      it('should not be nullable', () => {
        expect(columnInfo[famousPersonId].nullable).toBeFalse()
      })

      it('should not have a default value', () => {
        expect(columnInfo[famousPersonId].defaultValue).toBeNull()
      })
    })

    describe('display_name column', () => {

      const displayName = 'display_name'

      it('should be type text', () => {
        expect(columnInfo[displayName].type).toEqual('text')
      })

      it('should have no max length', () => {
        expect(columnInfo[displayName].maxLength).toBeNull()
      })
      
      it('should not be nullable', () => {
        expect(columnInfo[displayName].nullable).toBeFalse()
      })

      it('should not have a default value', () => {
        expect(columnInfo[displayName].defaultValue).toBeNull()
      })
    })
  })
})
