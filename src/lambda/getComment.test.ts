import test from './getComment';
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
      const res: any = await test(event, context, 'matches');
      const count: number = JSON.parse(res.body).message.Count;
      expect(count).to.equal(0);
    });
    it('should be two', async () => {
      const res: any = await test(event2, context, 'matches');
      const count: number = JSON.parse(res.body).message.Count;
      expect(count).to.equal(2);
    });
    it('should make error', async () => {
      const res: any = await test(event, context, 'mat');
      expect(res.statusCode).to.equal(400);
    });
  });
});

/*
      //AWSMock.setSDKInstance(AWS);
      awsMock.mock('DynamoDB', 'getItem', (params: GetItemInput, callback: Function) => {
        console.log('DynamoDB', 'getItem', 'mock called');
        callback(null, {pk: "foo", sk: "bar"});
      });
 
      let input: GetItemInput = { TableName: '', Key: {} };
      const dynamodb = new aws.DynamoDB();
      expect(await dynamodb.getItem(input).promise()).to.equal( { pk: 'foo', sk: 'bar' });
  
      awsMock.restore('DynamoDB');
*/