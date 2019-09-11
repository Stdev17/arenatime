import test from './getStat';
import chai = require('chai');
const expect = chai.expect;

describe('getStat', () => {
  describe('get result', () => {
    it('should succeed', async () => {
      const res: any = await test({}, {}, ['stat-table']);
      const count: number = res.statusCode;
      expect(count).to.equal(200);
    });
    it('should fail', async () => {
      const res: any = await test({}, {}, ['match-tabl']);
      const msg: string = JSON.parse(res.body).message;
      expect(msg).to.equal('Getting Stats Failed');
    });
  });
});