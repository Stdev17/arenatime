import test from './getSearch';
import chai = require('chai');
const expect = chai.expect;

const event1 = {
  target: 'defense',
  arena: 'all',
  date: 'all',
  power: 'all',
  sort: 'netUpvotes',
  result: 'attackWin',
  deck: {
    first: 'Miyako',
    second: 'Nozomi',
    third: 'Tamaki',
    fourth: 'Ninon',
    fifth: 'Mitsuki'
  }
};

const event2 = {
  target: 'defense',
  arena: 'all',
  date: 'all',
  power: 'test',
  sort: 'netUpvotes',
  result: 'attackWin',
  deck: {
    first: 'Miyako',
    second: 'Nozomi',
    third: 'Tamaki',
    fourth: 'Ninon',
    fifth: 'Mitsuki'
  }
};

const ev1 = {
  queryStringParameters: [JSON.stringify(event1)]
};

const ev2 = {
  queryStringParameters: [JSON.stringify(event2)]
};

describe('getSearch', () => {
  describe('get search query', () => {
    it('should succeed', async () => {
      const res: any = await test(ev1, {}, ['match-table']);
      const count: any = JSON.parse(res.body).message.length;
      expect(count).to.be.above(1);
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