import test from './getPart';
import chai = require('chai');
const expect = chai.expect;

const event1 = {
  deckType: 'attack',
  arena: 'all',
  matchResult: 'attackWin',
  deck: {
    first: 'SummerKyaru',
    second: 'Kyouka'
  }
};

const event2 = {
  deckType: 'fuck',
  arena: 'all',
  matchResult: 'attackWin',
  deck: {
    first: 'SummerKyaru',
    second: 'Kyouka'
  }
};

const ev1 = {
  queryStringParameters: [JSON.stringify(event1)]
};

const ev2 = {
  queryStringParameters: [JSON.stringify(event2)]
};

describe('getPart', () => {
  describe('get part from athena', () => {
    it('should succeed', async () => {
      const res: any = await test(ev1, {}, ['match-table']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(200);
    });
    it('should fail', async () => {
      const res: any = await test(ev1, {}, ['princonne-arenatime']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
    it('should fail', async () => {
      const res: any = await test(ev2, {}, ['match-table']);
      const count: number = JSON.parse(res.statusCode);
      expect(count).to.equal(400);
    });
  });
});