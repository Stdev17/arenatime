"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var getComment_1 = require("./getComment");
var dynamo = require("../util/dynamo");
var testEvent = {
    queryStringParameters: ['valid']
};
var context = {};
describe('getComment는', function () {
    describe('성공할 시', function () {
        var response = {
            Items: [],
            Count: 2,
            ScannedCount: 2
        };
        var spy = jest.spyOn(dynamo, 'dynamoQuery');
        beforeAll(function () {
            spy.mockImplementation(function (params) {
                return Promise.resolve(response);
            });
        });
        test('코멘트 테이블에 해당 매치가 있으면 1개 이상의 코멘트를 받아 온다', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var res, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getComment_1.handler(testEvent, context)];
                    case 1:
                        res = _a.sent();
                        count = JSON.parse(res.body).message.Count;
                        expect(count).toBe(2);
                        done();
                        return [2 /*return*/];
                }
            });
        }); });
        test('200을 반환한다', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var res, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getComment_1.handler(testEvent, context)];
                    case 1:
                        res = _a.sent();
                        status = res.statusCode;
                        expect(status).toBe(200);
                        done();
                        return [2 /*return*/];
                }
            });
        }); });
        afterAll(function () {
            spy.mockRestore();
        });
    });
    describe('실패할 시', function () {
        test('결과가 없으면 404를 반환한다', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var res, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getComment_1.handler(testEvent, context)];
                    case 1:
                        res = _a.sent();
                        status = res.statusCode;
                        expect(status).toBe(404);
                        done();
                        return [2 /*return*/];
                }
            });
        }); });
        test('에러가 생기면 500을 반환한다', function (done) { return __awaiter(void 0, void 0, void 0, function () {
            var spy, res, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        spy = jest
                            .spyOn(dynamo, 'dynamoQuery')
                            .mockImplementation(function (params) {
                            return Promise.reject(new Error());
                        });
                        return [4 /*yield*/, getComment_1.handler(testEvent, context)];
                    case 1:
                        res = _a.sent();
                        status = res.statusCode;
                        expect(status).toBe(500);
                        spy.mockRestore();
                        done();
                        return [2 /*return*/];
                }
            });
        }); });
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
