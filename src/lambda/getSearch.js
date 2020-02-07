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
var prime_1 = require("../util/prime");
var moment = require("moment");
aws.config.update({ region: 'ap-northeast-2' });
var dyn = new aws.DynamoDB();
var table = 'match-table';
function setId(req) {
    var id = 1;
    var deck = req.deck;
    for (var tmp in deck) {
        id *= prime_1["default"][deck[tmp]];
    }
    if (id === NaN) {
        return 1;
    }
    return id;
}
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var req, deckId, params, date, queries, get, res, buf, tmp, i, j, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = JSON.parse(event.queryStringParameters[0]);
                deckId = setId(req);
                params = {};
                params = {
                    TableName: table,
                    ExpressionAttributeValues: {
                        ':deckId': { N: deckId.toString() }
                    }
                };
                if (req.arena === 'battleArena') {
                    params.ExpressionAttributeValues[':arena'] = { S: 'princessArena' };
                }
                if (req.arena === 'princessArena') {
                    params.ExpressionAttributeValues[':arena'] = { S: 'battleArena' };
                }
                if (req.arena === 'all') {
                    params.ExpressionAttributeValues[':arena'] = { S: 'all' };
                }
                switch (req.date) {
                    case "all":
                        date = moment().subtract(5, 'years').format("YYYY-MM-DD HH:mm:ss");
                        params.ExpressionAttributeValues[':date'] = { S: date };
                        break;
                    case "week":
                        date = moment().subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss");
                        params.ExpressionAttributeValues[':date'] = { S: date };
                        break;
                    case "month":
                        date = moment().subtract(30, 'days').format("YYYY-MM-DD HH:mm:ss");
                        params.ExpressionAttributeValues[':date'] = { S: date };
                        break;
                    case "season":
                        date = moment().subtract(90, 'days').format("YYYY-MM-DD HH:mm:ss");
                        params.ExpressionAttributeValues[':date'] = { S: date };
                        break;
                    default:
                        break;
                }
                switch (req.power) {
                    case "all":
                        params.ExpressionAttributeValues[':upper'] = { N: '100000' };
                        params.ExpressionAttributeValues[':lower'] = { N: '-1' };
                        break;
                    case ">55000":
                        params.ExpressionAttributeValues[':upper'] = { N: '80000' };
                        params.ExpressionAttributeValues[':lower'] = { N: '55000' };
                        break;
                    case ">50000":
                        params.ExpressionAttributeValues[':upper'] = { N: '55000' };
                        params.ExpressionAttributeValues[':lower'] = { N: '50000' };
                        break;
                    case ">45000":
                        params.ExpressionAttributeValues[':upper'] = { N: '50000' };
                        params.ExpressionAttributeValues[':lower'] = { N: '45000' };
                        break;
                    case ">40000":
                        params.ExpressionAttributeValues[':upper'] = { N: '45000' };
                        params.ExpressionAttributeValues[':lower'] = { N: '40000' };
                        break;
                    case "<40000":
                        params.ExpressionAttributeValues[':upper'] = { N: '40000' };
                        params.ExpressionAttributeValues[':lower'] = { N: '50' };
                        break;
                    default:
                        break;
                }
                if (req.target === 'defense' && req.sort === 'netUpvotes') {
                    params.IndexName = 'defenseVotes';
                    if (req.result === 'victory') {
                        params.ExpressionAttributeValues[':result'] = { S: 'attackWin' };
                    }
                    else if (req.result === 'all') {
                        params.ExpressionAttributeValues[':result'] = { S: 'all' };
                    }
                    else {
                        params.ExpressionAttributeValues[':result'] = { S: 'defenseWin' };
                    }
                    params.ScanIndexForward = false;
                    params.KeyConditionExpression = 'defenseDeckId = :deckId';
                    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
                    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and uploadedDate > :date and arena <> :arena and matchResult <> :result';
                }
                if (req.target === 'attack' && req.sort === 'netUpvotes') {
                    params.IndexName = 'attackVotes';
                    if (req.result === 'defeat') {
                        params.ExpressionAttributeValues[':result'] = { S: 'attackWin' };
                    }
                    else if (req.result === 'all') {
                        params.ExpressionAttributeValues[':result'] = { S: 'all' };
                    }
                    else {
                        params.ExpressionAttributeValues[':result'] = { S: 'defenseWin' };
                    }
                    params.ScanIndexForward = false;
                    params.KeyConditionExpression = 'attackDeckId = :deckId';
                    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
                    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and uploadedDate > :date and arena <> :arena and matchResult <> :result';
                }
                if (req.target === 'defense' && req.sort === 'latest') {
                    params.IndexName = 'defenseDate';
                    if (req.result === 'victory') {
                        params.ExpressionAttributeValues[':result'] = { S: 'attackWin' };
                    }
                    else if (req.result === 'all') {
                        params.ExpressionAttributeValues[':result'] = { S: 'all' };
                    }
                    else {
                        params.ExpressionAttributeValues[':result'] = { S: 'defenseWin' };
                    }
                    params.ScanIndexForward = false;
                    params.KeyConditionExpression = 'defenseDeckId = :deckId and uploadedDate > :date';
                    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
                    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and arena <> :arena and matchResult <> :result';
                }
                if (req.target === 'attack' && req.sort === 'latest') {
                    params.IndexName = 'attackDate';
                    if (req.result === 'defeat') {
                        params.ExpressionAttributeValues[':result'] = { S: 'attackWin' };
                    }
                    else if (req.result === 'all') {
                        params.ExpressionAttributeValues[':result'] = { S: 'all' };
                    }
                    else {
                        params.ExpressionAttributeValues[':result'] = { S: 'defenseWin' };
                    }
                    params.ScanIndexForward = false;
                    params.KeyConditionExpression = 'attackDeckId = :deckId and uploadedDate > :date';
                    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
                    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and arena <> :arena and matchResult <> :result';
                }
                queries = [];
                queries = [];
                return [4 /*yield*/, dyn.query(params).promise()
                        .then(function (data) {
                        if (queries.length === 0 && data['Count'] !== 0) {
                            queries.push(data);
                            return {
                                statusCode: 200,
                                body: JSON.stringify({
                                    message: 'Query Succeeded',
                                    runtime: 'ok'
                                })
                            };
                        }
                        return {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'No Result',
                                runtime: 'ok'
                            })
                        };
                    })["catch"](function (err) {
                        var result = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Query Failed',
                                runtime: err
                            })
                        };
                        return result;
                    })];
            case 1:
                get = _a.sent();
                if (get.statusCode === 400) {
                    return [2 /*return*/, get];
                }
                if (queries.length === 0) {
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Deck Not Found',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        }];
                }
                res = [];
                res = [];
                buf = [];
                buf = [];
                for (i in queries) {
                    for (j in queries[i]['Items']) {
                        buf.push(queries[i]['Items'][j]);
                    }
                }
                for (i = 0; i < buf.length; i++) {
                    if (i % 5 === 0) {
                        tmp = { 'Items': [] };
                    }
                    tmp['Items'].push(buf[i]);
                    if (i % 5 === 4) {
                        res.push(tmp);
                    }
                }
                if (buf.length % 5 !== 0) {
                    res.push(tmp);
                }
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: res,
                            runtime: context
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                            'Access-Control-Allow-Credentials': true
                        }
                    }];
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
