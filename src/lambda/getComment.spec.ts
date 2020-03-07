import { handler } from './getComment';
import * as dynamo from '../util/dynamo';

const { dynamoQuery } = dynamo;

const invalidEvent = {
  queryStringParameters: ['invalid'],
};
const validEvent = {
  queryStringParameters: ['valid'],
};
const context = {};

describe('getComment는', () => {
  describe('성공할 시', () => {
    const response = {
      Items: [],
      Count: 2,
      ScannedCount: 2,
    };
    const spy = jest.spyOn(dynamo, 'dynamoQuery').mockImplementation(params => {
      return Promise.resolve(response);
    });

    test('코멘트 테이블에 해당 매치가 있으면 1개 이상의 코멘트를 받아 온다', async done => {
      const res = await handler(validEvent, context);
      const count: number = JSON.parse(res.body).message.Count;
      console.log(res);
      expect(spy).toHaveBeenCalled();
      expect(count).toBe(2);
      done();
    });
    test('200을 반환한다', async done => {
      const res = await handler(validEvent, context);
      const status: number = res.statusCode;
      expect(status).toBe(200);
      done();
    });
  });
});

/*
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
