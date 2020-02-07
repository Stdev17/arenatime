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
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var req, myIp, checkParams, check, resCheck, checkVote, upv, dov, u, d, getParams, get, resGet, setUpvote, setDownvote, upvoteValue, downvoteValue, netUpvoteValue, u, u, setParams, updateMatch, voterParams, updateVoter;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = JSON.parse(event.body);
                myIp = event.requestContext.identity.sourceIp;
                checkParams = {
                    TableName: 'voter-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    ProjectionExpression: 'upvoters, downvoters'
                };
                return [4 /*yield*/, dyn.getItem(checkParams).promise()
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
                            })
                        };
                        return result;
                    })];
            case 1:
                check = _a.sent();
                resCheck = JSON.parse(check.body)['message']['Item'];
                checkVote = "Not Voted";
                upv = resCheck['upvoters']['L'];
                dov = resCheck['downvoters']['L'];
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
                getParams = {
                    TableName: 'match-table',
                    ProjectionExpression: 'upvotes, downvotes, netUpvotes',
                    Key: {
                        'matchId': { S: req.matchId }
                    }
                };
                return [4 /*yield*/, dyn.getItem(getParams).promise()
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
                            })
                        };
                        return result;
                    })];
            case 2:
                get = _a.sent();
                resGet = JSON.parse(get.body)['message']['Item'];
                setUpvote = 'none', setDownvote = 'none';
                upvoteValue = Number(resGet['upvotes']['N']);
                downvoteValue = Number(resGet['downvotes']['N']);
                netUpvoteValue = Number(resGet['netUpvotes']['N']);
                if (checkVote == 'Not Voted') {
                    if (req['vote'] == 'up') {
                        setUpvote = 'vote';
                        setDownvote = 'none';
                    }
                    else {
                        setUpvote = 'none';
                        setDownvote = 'vote';
                    }
                }
                else if (checkVote == 'Upvoted') {
                    if (req['vote'] == 'up') {
                        setUpvote = 'unvote';
                        setDownvote = 'none';
                    }
                    else {
                        setUpvote = 'unvote';
                        setDownvote = 'vote';
                    }
                }
                else {
                    if (req['vote'] == 'up') {
                        setUpvote = 'vote';
                        setDownvote = 'unvote';
                    }
                    else {
                        setUpvote = 'none';
                        setDownvote = 'unvote';
                    }
                }
                //
                if (setUpvote == 'vote') {
                    resCheck['upvoters']['L'].push({ S: myIp.toString() });
                    upvoteValue += Number(1);
                    netUpvoteValue += Number(1);
                }
                else if (setUpvote == 'unvote') {
                    for (u = 0; u < resCheck['upvoters']['L'].length; u++) {
                        if (resCheck['upvoters']['L'][u]['S'] == myIp) {
                            resCheck['upvoters']['L'].splice(u, 1);
                            upvoteValue -= Number(1);
                            netUpvoteValue -= Number(1);
                            break;
                        }
                    }
                }
                if (setDownvote == 'vote') {
                    resCheck['downvoters']['L'].push({ S: myIp.toString() });
                    downvoteValue += Number(1);
                    netUpvoteValue -= Number(1);
                }
                else if (setDownvote == 'unvote') {
                    for (u = 0; u < resCheck['downvoters']['L'].length; u++) {
                        if (resCheck['downvoters']['L'][u]['S'] == myIp) {
                            resCheck['downvoters']['L'].splice(u, 1);
                            downvoteValue -= Number(1);
                            netUpvoteValue += Number(1);
                            break;
                        }
                    }
                }
                setParams = {
                    TableName: 'match-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    UpdateExpression: 'set netUpvotes = :net, upvotes = :up, downvotes = :down',
                    ExpressionAttributeValues: {
                        ':net': { N: netUpvoteValue.toString() },
                        ':up': { N: upvoteValue.toString() },
                        ':down': { N: downvoteValue.toString() }
                    }
                };
                return [4 /*yield*/, dyn.updateItem(setParams).promise()
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
                                message: 'Setting Votes Failed',
                                runtime: err
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return result;
                    })];
            case 3:
                updateMatch = _a.sent();
                if (JSON.parse(updateMatch.body)['message'] == 'Setting Votes Failed') {
                    return [2 /*return*/, updateMatch];
                }
                voterParams = {
                    TableName: 'voter-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    UpdateExpression: 'set upvoters = :up, downvoters = :down',
                    ExpressionAttributeValues: {
                        ':up': { L: resCheck['upvoters']['L'] },
                        ':down': { L: resCheck['downvoters']['L'] }
                    }
                };
                return [4 /*yield*/, dyn.updateItem(voterParams).promise()
                        .then(function () {
                        var result = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Vote Succeeded',
                                vote: {
                                    up: setUpvote,
                                    down: setDownvote
                                },
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
                                message: 'Setting Voters Failed',
                                runtime: err
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return result;
                    })];
            case 4:
                updateVoter = _a.sent();
                return [2 /*return*/, updateVoter];
        }
    });
}); };
