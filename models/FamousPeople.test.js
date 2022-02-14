/* eslint prefer-destructuring: ["error", {"object": true, "array": false}] */
//
// FamousPeople.test.js
// test FamousPeople objection.js model
//
import FamousPeople from './FamousPeople'

describe('FamousPeople model', () => {

  describe('static properties', () => {

    describe('tableName', () => {

      it('should return "famous_people"', () => {
        expect(FamousPeople.tableName).toEqual('famous_people')
      })
    })

    describe('idColumn', () => {

      it('should return "famous_person_id"', () => {
        expect(FamousPeople.idColumn).toEqual('famous_person_id')
      })
    })
  })

  describe('columns', () => {

    let tableMetadata

    beforeEach(async () => {
      tableMetadata = await FamousPeople.fetchTableMetadata()
    })

    it('should have two columns', async () => {
      expect(tableMetadata.columns.length).toEqual(2)
    })

    it('should have column "famous_person_id"', () => {
      expect(tableMetadata.columns).toContain('famous_person_id')
    })

    it('should have column "display_name"', () => {
      expect(tableMetadata.columns).toContain('display_name')
    })
  })

  // describe('WHEN queried', () => {

  //   let queryResult

  //   beforeAll(async () => {
  //     queryResult = await FamousPeople.query()
  //   })

  //   it('should return at least one record (with test data)', () => {
  //     expect(queryResult).not.toBeNull()
  //   })

  //   describe('first record', () => {

  //     let firstRecord

  //     beforeAll(() => {
  //       firstRecord = queryResult[0]
  //     })
  //   })
  // })
})
