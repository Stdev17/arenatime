import test from './getCount';
import chai = require('chai');
const expect = chai.expect;

describe('getComment', () => {
  describe('query comments', () => {
    it('should succeed', async () => {
      const res: any = await test({}, {}, ['match-table']);
      const count: number = JSON.parse(res.body).message;
      expect(count).to.be.above(800);
    });
    it('should fail', async () => {
      const res: any = await test({}, {}, ['match-tabl']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
  });
});