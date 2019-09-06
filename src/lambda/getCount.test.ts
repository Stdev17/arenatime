import test from './getCount';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

describe('getComment', () => {
  describe('query comments', () => {
    it('should succeed', async () => {
      const res: any = await test(event, context, 'match-table');
      const count: number = JSON.parse(res.body).message;
      expect(count).to.be.above(800);
    });
    it('should fail', async () => {
      const res: any = await test(event, context, 'match-tabl');
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
  });
});