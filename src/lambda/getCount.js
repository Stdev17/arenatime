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
var aws = require("aws-sdk");
aws.config.update({ region: 'ap-northeast-2' });
var dyn = new aws.DynamoDB();
var table = 'match-table';
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var params, get;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    TableName: table
                };
                return [4 /*yield*/, dyn.describeTable(params).promise()
                        .then(function (data) {
                        var msg = 0;
                        if (data['Table'] !== undefined) {
                            if (data['Table']['ItemCount'] !== undefined) {
                                msg = data['Table']['ItemCount'];
                            }
                        }
                        else {
                            throw 'error';
                        }
                        var result = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: msg,
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return result;
                    })["catch"](function (err) {
                        var result = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Getting Count Failed',
                                runtime: err
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return result;
                    })];
            case 1:
                get = _a.sent();
                return [2 /*return*/, get];
        }
    });
}); };
/** 유닛 테스트에 호출되는 함수 */
function test(event, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    table = args[0];
                    return [4 /*yield*/, exports.handler(event, context)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports["default"] = test;
