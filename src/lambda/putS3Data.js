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
var datePrefix_1 = require("../util/datePrefix");
var char_1 = require("../util/char");
var prime_1 = require("../util/prime");
var aws = require("aws-sdk");
var moment = require("moment");
var uuid = require("uuid/v4");
var comb_1 = require("../util/comb");
var node_gzip_1 = require("node-gzip");
var ubase_1 = require("../util/ubase");
aws.config.update({ region: 'ap-northeast-2' });
var s3 = new aws.S3();
var dyn = new aws.DynamoDB();
function validateProperties(f) {
    //Power
    if (!(f.attackPower > 100) && f.attackPower !== 0) {
        return false;
    }
    if (!(f.attackPower < 100000)) {
        return false;
    }
    if (!(f.defensePower > 100) && f.defensePower !== 0) {
        return false;
    }
    if (!(f.defensePower < 100000)) {
        return false;
    }
    //Arena
    if (f.arena != "battleArena" && f.arena != "princessArena") {
        return false;
    }
    //result
    if (f.matchResult != "attackWin" && f.matchResult != "defenseWin") {
        return false;
    }
    return true;
}
function validateStarAndDeck(f) {
    if (f.attackNum > 5 || f.attackNum < 1 || f.defenseNum > 5 || f.defenseNum < 1) {
        return false;
    }
    var aStarCount = 0;
    var aDeckCount = 0;
    var dStarCount = 0;
    var dDeckCount = 0;
    var a = f.attackStar;
    for (var tmp in a) {
        if (a[tmp] < 1 || (a[tmp] !== 9 && a[tmp] > 5)) {
            return false;
        }
        aStarCount += 1;
    }
    var d = f.defenseStar;
    for (var tmp in d) {
        if (a[tmp] < 1 || (a[tmp] !== 9 && a[tmp] > 5)) {
            return false;
        }
        dStarCount += 1;
    }
    var aDeck = f.attackDeck;
    for (var t in aDeck) {
        var tmp = aDeck[t];
        if (!char_1["default"].includes(tmp)) {
            console.log(tmp);
            return false;
        }
        if (tmp != "Empty") {
            aDeckCount += 1;
        }
    }
    var dDeck = f.defenseDeck;
    for (var t in dDeck) {
        var tmp = dDeck[t];
        if (!char_1["default"].includes(tmp)) {
            console.log(tmp);
            return false;
        }
        if (tmp != "Empty") {
            dDeckCount += 1;
        }
    }
    if (f.attackNum != aStarCount || aStarCount != aDeckCount || aDeckCount != f.attackNum) {
        return false;
    }
    if (f.defenseNum != dStarCount || dStarCount != dDeckCount || dDeckCount != f.defenseNum) {
        return false;
    }
    return true;
}
function getDuo(d) {
    var size = 0;
    var deck = [];
    deck = [];
    for (var tmp in d) {
        deck.push(prime_1["default"][d[tmp]]);
        size += 1;
    }
    if (size < 2) {
        return [];
    }
    var du = comb_1["default"](deck, 2);
    var duo = [];
    duo = [];
    var a;
    while (a = du.next()) {
        var sum = 1;
        while (a.length > 0) {
            sum *= a.pop();
        }
        duo.push(sum);
    }
    return duo;
}
function getTrio(d) {
    var size = 0;
    var deck = [];
    deck = [];
    for (var tmp in d) {
        deck.push(prime_1["default"][d[tmp]]);
        size += 1;
    }
    if (size < 3) {
        return [];
    }
    var t = comb_1["default"](deck, 3);
    var trio = [];
    trio = [];
    var a;
    while (a = t.next()) {
        var sum = 1;
        while (a.length > 0) {
            sum *= a.pop();
        }
        trio.push(sum);
    }
    return trio;
}
function getItem(p) {
    var attd = {};
    attd = {};
    var aDeck = p.attackDeck;
    for (var a in aDeck) {
        attd[a] = { S: aDeck[a] };
    }
    var defd = {};
    defd = {};
    var dDeck = p.defenseDeck;
    for (var d in dDeck) {
        defd[d] = { S: dDeck[d] };
    }
    var atts = {};
    atts = {};
    var aStar = p.attackStar;
    for (var a in aStar) {
        atts[a] = { N: aStar[a].toString() };
    }
    var defs = {};
    defs = {};
    var dStar = p.defenseStar;
    for (var d in dStar) {
        defs[d] = { N: dStar[d].toString() };
    }
    var aDuo = [];
    aDuo = [];
    for (var a in p.attackDuo) {
        aDuo.push({ N: p.attackDuo[a].toString() });
    }
    var dDuo = [];
    dDuo = [];
    for (var d in p.defenseDuo) {
        dDuo.push({ N: p.defenseDuo[d].toString() });
    }
    var aTrio = [];
    aTrio = [];
    for (var a in p.attackTrio) {
        aTrio.push({ N: p.attackTrio[a].toString() });
    }
    var dTrio = [];
    dTrio = [];
    for (var d in p.defenseTrio) {
        dTrio.push({ N: p.defenseTrio[d].toString() });
    }
    var temp = {
        matchResult: { S: p.matchResult },
        arena: { S: p.arena },
        memo: { S: p.memo },
        attackPower: { N: p.attackPower.toString() },
        attackDeck: { M: attd },
        attackStar: { M: atts },
        defensePower: { N: p.defensePower.toString() },
        defenseDeck: { M: defd },
        defenseStar: { M: defs },
        imagePath: { S: p.imagePath },
        matchId: { S: p.matchId },
        uploadedDate: { S: p.uploadedDate },
        attackDeckId: { N: p.attackDeckId.toString() },
        defenseDeckId: { N: p.defenseDeckId.toString() },
        attackDuo: { L: aDuo },
        attackTrio: { L: aTrio },
        defenseDuo: { L: dDuo },
        defenseTrio: { L: dTrio },
        netUpvotes: { N: p.netUpvotes.toString() },
        upvotes: { N: p.upvotes.toString() },
        downvotes: { N: p.downvotes.toString() },
        userIp: { S: p.userIp },
        netComments: { N: p.netComments.toString() }
    };
    return temp;
}
var parseData = function (req) {
    if (!validateProperties(req)) {
        return {};
    }
    if (!validateStarAndDeck(req)) {
        return {};
    }
    if (req.memo == "") {
        req.memo = "PlaceHolder";
    }
    req.matchId = ubase_1["default"](uuid());
    req.uploadedDate = moment().add(9, 'hours').format("YYYY-MM-DD HH:mm:ss");
    var attackDeckId = 1;
    var defenseDeckId = 1;
    for (var tmp in req.attackDeck) {
        attackDeckId *= prime_1["default"][req.attackDeck[tmp]];
    }
    for (var tmp in req.defenseDeck) {
        defenseDeckId *= prime_1["default"][req.defenseDeck[tmp]];
    }
    req.attackDeckId = attackDeckId;
    req.defenseDeckId = defenseDeckId;
    req.attackDuo = getDuo(req.attackDeck);
    req.attackTrio = getTrio(req.attackDeck);
    req.defenseDuo = getDuo(req.defenseDeck);
    req.defenseTrio = getTrio(req.defenseDeck);
    req.netUpvotes = 0;
    req.upvotes = 0;
    req.downvotes = 0;
    req.netComments = 0;
    return req;
};
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var request, parsed, response, item, dataParams, vote, voteParams, filePath, fileName, fileFullName, fileFullPath, z, gz, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                request = JSON.parse(event.body);
                parsed = parseData(request);
                if (parsed.downvotes === undefined) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "parse error",
                            runtime: context
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                            'Access-Control-Allow-Credentials': true
                        }
                    };
                    return [2 /*return*/, response];
                }
                if (parsed.imagePath === undefined) {
                    parsed.imagePath = 'PlaceHolder';
                }
                parsed.userIp = event.requestContext.identity.sourceIp;
                item = getItem(parsed);
                dataParams = {
                    TableName: "match-table",
                    Item: item
                };
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, dyn.putItem(dataParams, function (err) {
                                    if (err) {
                                        var response = {
                                            statusCode: 400,
                                            body: JSON.stringify({
                                                message: err,
                                                runtime: context
                                            }),
                                            headers: {
                                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                                'Access-Control-Allow-Credentials': true
                                            }
                                        };
                                        console.log(item);
                                        console.log(err);
                                        return response;
                                    }
                                    else {
                                        return;
                                    }
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })();
                vote = {
                    matchId: parsed.matchId,
                    upvoters: [],
                    downvoters: []
                };
                voteParams = {
                    TableName: "voter-table",
                    Item: {
                        matchId: { S: vote.matchId },
                        upvoters: { L: vote.upvoters },
                        downvoters: { L: vote.downvoters }
                    }
                };
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, dyn.putItem(voteParams, function (err) {
                                    if (err) {
                                        var response = {
                                            statusCode: 400,
                                            body: JSON.stringify({
                                                message: err,
                                                runtime: context
                                            }),
                                            headers: {
                                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                                'Access-Control-Allow-Credentials': true
                                            }
                                        };
                                        console.log(err);
                                        return response;
                                    }
                                    else {
                                        return;
                                    }
                                })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })();
                filePath = datePrefix_1["default"]();
                fileName = parsed.matchId + ".gz";
                fileFullName = filePath + fileName;
                fileFullPath = 'data/' + fileFullName;
                z = Buffer.from(JSON.stringify(parsed));
                return [4 /*yield*/, node_gzip_1.gzip(z)];
            case 1:
                gz = _a.sent();
                params = {
                    Bucket: 'priconne-arenatime',
                    Body: gz,
                    Key: fileFullPath,
                    ContentType: 'application/json',
                    ContentEncoding: 'gzip'
                };
                return [2 /*return*/, s3.putObject(params).promise()
                        .then(function () {
                        var response = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Succeeded Data Upload',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })["catch"](function () {
                        var response = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Upload Failed',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })];
        }
    });
}); };
