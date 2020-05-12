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
var mTable = 'match-table';
var vTable = 'voter-table';
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var req, myIp, params, get, voteParams, voters, voteParsed, resVote, checkVote, upv, dov, u, d, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = event.queryStringParameters[0];
                myIp = event.requestContext.identity.sourceIp;
                params = {
                    TableName: mTable,
                    ProjectionExpression: 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, imagePath, matchId, matchResult, netComments',
                    Key: {
                        'matchId': { S: req }
                    }
                };
                return [4 /*yield*/, dyn.getItem(params).promise()
                        .then(function (data) {
                        var result = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: data,
                                runtime: context
                            })
                        };
                        return result;
                    })["catch"](function (err) {
                        var result = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Getting Item Failed',
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
                if (JSON.parse(get.body).message === 'Getting Item Failed') {
                    return [2 /*return*/, get];
                }
                voteParams = {
                    TableName: vTable,
                    Key: {
                        'matchId': { S: req }
                    },
                    ProjectionExpression: 'upvoters, downvoters'
                };
                return [4 /*yield*/, dyn.getItem(voteParams).promise()
                        .then(function (data) {
                        var result = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: data,
                                runtime: context
                            })
                        };
                        return result;
                    })["catch"](function (err) {
                        var result = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Getting Voters Failed',
                                runtime: err
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return result;
                    })];
            case 2:
                voters = _a.sent();
                voteParsed = JSON.parse(voters.body);
                if (voteParsed['message'] === 'Getting Voters Failed') {
                    return [2 /*return*/, voters];
                }
                if (voteParsed['message']['Item'] === undefined) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Getting Voters Failed',
                                runtime: 'err'
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        }];
                }
                resVote = voteParsed['message']['Item'];
                checkVote = "Not Voted";
                upv = resVote['upvoters']['L'];
                dov = resVote['downvoters']['L'];
                for (u in upv) {
                    if (upv[u]['S'] == myIp) {
                        checkVote = 'Upvoted';
                        break;
                    }
                }
                for (d in dov) {
                    if (dov[d]['S'] == myIp) {
                        checkVote = 'Downvoted';
                        break;
                    }
                }
                result = {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: JSON.parse(get.body)['message'],
                        vote: checkVote,
                        runtime: context
                    }),
                    headers: {
                        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                        'Access-Control-Allow-Credentials': true
                    }
                };
                return [2 /*return*/, result];
        }
    });
}); };
/** 유닛 테스트에 호출되는 함수 */
function test(event, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mTable = args[0];
                    vTable = args[1];
                    return [4 /*yield*/, exports.handler(event, context)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports["default"] = test;
