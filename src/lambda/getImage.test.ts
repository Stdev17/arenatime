import test from './getImage';
import chai = require('chai');
const expect = chai.expect;

const event1 = {
  queryStringParameters: ["test"]
};

const event2 = {
  queryStringParameters: ["images/2019/7/31/dbbca1ef-b946-4776-8c1d-d304857b759e.jpg"]
};

describe('getImage', () => {
  describe('get image object from bucket', () => {
    it('should succeed', async () => {
      const res: any = await test(event2, {}, ['priconne-arenatime']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(200);
    });
    it('should fail', async () => {
      const res: any = await test(event1, {}, ['princonne-arenatime']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
    it('should fail', async () => {
      const res: any = await test(event2, {}, ['princonne-arenatim']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
  });
});