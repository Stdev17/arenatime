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
var athenaClient = require("athena-client");
var prime_1 = require("../util/prime");
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
var clientConfig = {
    bucketUri: 's3://aws-athena-query-results-527044138162-ap-northeast-2/',
    database: 'aggregated'
};
var awsConfig = {
    region: 'ap-northeast-2'
};
var athena = athenaClient.createClient(clientConfig, awsConfig);
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var req, count, result, queryString, id, query, err_1, result, queries, matches, error, _a, _b, _i, m, params, result, result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                req = JSON.parse(event.queryStringParameters[0]);
                count = Object.keys(req.deck).length;
                if ((req.deckType !== 'defense' && req.deckType !== 'attack') || (req.matchResult !== "attackWin" && req.matchResult !== 'defenseWin' && req.matchResult !== 'all') || (req.arena !== 'all' && req.arena !== 'battleArena' && req.arena !== 'princessArena') || (count > 3 && count < 2)) {
                    result = {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Parsing Failed',
                            runtime: 'err'
                        })
                    };
                    return [2 /*return*/, result];
                }
                queryString = "";
                id = setId(req);
                if (req.deckType === 'defense' && count === 2) {
                    queryString = "select matchid from matches where contains(defenseduo, " + id + ") and arena <> '" + req.arena + "' and matchresult <> '" + req.matchResult + "' limit 50";
                }
                else if (req.deckType === 'defense' && count === 3) {
                    queryString = "select matchid from matches where contains(defensetrio, " + id + ") and arena <> '" + req.arena + "' and matchresult <> '" + req.matchResult + "' limit 50";
                }
                else if (req.deckType === 'attack' && count === 2) {
                    queryString = "select matchid from matches where contains(attackduo, " + id + ") and arena <> '" + req.arena + "' and matchresult <> '" + req.matchResult + "' limit 50";
                }
                else if (req.deckType === 'attack' && count === 3) {
                    queryString = "select matchid from matches where contains(attacktrio, " + id + ") and arena <> '" + req.arena + "' and matchresult <> '" + req.matchResult + "' limit 50";
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, athena.execute(queryString).toPromise()];
            case 2:
                query = _c.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _c.sent();
                result = {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Query Failed',
                        runtime: err_1
                    }),
                    headers: {
                        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                        'Access-Control-Allow-Credentials': true
                    }
                };
                return [2 /*return*/, result];
            case 4:
                queries = query['records'];
                matches = [];
                matches = [];
                error = false;
                _a = [];
                for (_b in queries)
                    _a.push(_b);
                _i = 0;
                _c.label = 5;
            case 5:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                m = _a[_i];
                params = {
                    TableName: table,
                    ProjectionExpression: 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments',
                    Key: {
                        'matchId': { S: queries[m]['matchid'] }
                    }
                };
                return [4 /*yield*/, dyn.getItem(params).promise()
                        .then(function (data) {
                        if (data['Item'] !== undefined && data['Item']['attackDeck'] !== undefined) {
                            matches.push(data['Item']);
                        }
                        return;
                    })["catch"](function () {
                        error = true;
                        return;
                    })];
            case 6:
                _c.sent();
                _c.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8:
                if (error) {
                    result = {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Getting Items Failed',
                            runtime: context
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                            'Access-Control-Allow-Credentials': true
                        }
                    };
                    return [2 /*return*/, result];
                }
                else {
                    result = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: matches,
                            runtime: context
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                            'Access-Control-Allow-Credentials': true
                        }
                    };
                    return [2 /*return*/, result];
                }
                return [2 /*return*/];
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
