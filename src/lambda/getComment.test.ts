import handler from './getComment';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const event = {
  queryStringParameters: ["fuck"]
};
const context = {

};
const event2 = {
  queryStringParameters: [".O0FLtcWIDXSpzf0I1PT0V"]
};

describe('getComment', () => {
  describe('query comments', () => {
    it('should be equal', async () => {
      const res: any = await handler(event, context);
      const count: number = JSON.parse(res.body).message.Count;
      expect(count).to.equal(0);
    });
    it('should be two', async () => {
      const res: any = await handler(event2, context);
      const count: number = JSON.parse(res.body).message.Count;
      expect(count).to.equal(2);
  });
  });
});