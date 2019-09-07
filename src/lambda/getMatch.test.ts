import test from './getMatch';
import chai = require('chai');
const expect = chai.expect;

const event1 = {
  queryStringParameters: ["test"],
  requestContext: {
    identity: {
      sourceIp: '127.0.0.1'
    }
  }
};

const event2 = {
  queryStringParameters: ["0PDpntEcHgXmgxBoha.ULV"],
  requestContext: {
    identity: {
      sourceIp: '127.0.0.1'
    }
  }
};

describe('getMatch', () => {
  describe('get match from db', () => {
    it('should succeed', async () => {
      const res: any = await test(event2, {}, ['match-table', 'voter-table']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(200);
    });
    it('should fail', async () => {
      const res: any = await test(event1, {}, ['match-table', 'voter-table']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
    it('should fail for tables', async () => {
      const res: any = await test(event2, {}, ['match-tabl', 'voter-table']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
    it('should fail for tables', async () => {
      const res: any = await test(event2, {}, ['match-table', 'voter-tabl']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
  });
});