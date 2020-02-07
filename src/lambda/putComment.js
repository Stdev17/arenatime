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
var comment_char_1 = require("../util/comment_char");
var uuid = require("uuid/v4");
var ubase_1 = require("../util/ubase");
var moment = require("moment");
aws.config.update({ region: 'ap-northeast-2' });
var dyn = new aws.DynamoDB();
/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
exports.handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var req, com, params, ips, tmp, i, getComments, coms, chkIp, myName, myChar, i, del, name_1, setParams, comParams, putParams, comParams, putParams, params_1, chk, response, comParams, setParams;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = JSON.parse(event.body);
                com = {
                    matchId: { S: req.matchId },
                    commentId: { S: ubase_1["default"](uuid()) },
                    userIp: { S: event.requestContext.identity.sourceIp },
                    memo: { S: req.memo },
                    uploadedDate: { S: moment().add(9, 'hours').format("YYYY-MM-DD HH:mm:ss") }
                };
                params = {
                    TableName: 'commenter-table',
                    ProjectionExpression: 'commentIps',
                    Key: {
                        'matchId': { S: req.matchId }
                    }
                };
                return [4 /*yield*/, dyn.getItem(params).promise()
                        .then(function (data) {
                        return data['Item'];
                    })["catch"](function (err) {
                        console.log(err);
                        return;
                    })];
            case 1:
                ips = _a.sent();
                tmp = {};
                tmp = {};
                if (ips === undefined) {
                    ips = {};
                }
                else {
                    for (i in ips.commentIps['M']) {
                        tmp[i] = { S: ips.commentIps['M'][i]['S'] };
                    }
                }
                ips = tmp;
                getComments = {
                    TableName: 'match-table',
                    ProjectionExpression: 'netComments',
                    Key: {
                        'matchId': { S: req.matchId }
                    }
                };
                return [4 /*yield*/, dyn.getItem(getComments).promise()
                        .then(function (data) {
                        return data;
                    })["catch"](function (err) {
                        console.log(err);
                        return;
                    })];
            case 2:
                coms = _a.sent();
                if (coms['Item']['netComments'] !== undefined) {
                    coms = coms['Item']['netComments']['N'];
                }
                else {
                    coms = 0;
                }
                chkIp = false;
                myName = "";
                myChar = comment_char_1["default"].slice();
                myChar = myChar;
                for (i in ips) {
                    del = myChar.indexOf(ips[i]['S']);
                    myChar.splice(del, 1);
                    if (i === com.userIp['S']) {
                        chkIp = true;
                        myName = ips[i]['S'];
                        break;
                    }
                }
                if (!(!chkIp && myChar.length !== 0 && req.action === 'put')) return [3 /*break*/, 4];
                name_1 = myChar[Math.floor(Math.random() * myChar.length)];
                com['charName'] = { S: name_1 };
                ips[com.userIp['S']] = { S: name_1 };
                setParams = {
                    TableName: 'commenter-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    UpdateExpression: 'set commentIps = :com',
                    ExpressionAttributeValues: {
                        ':com': { M: ips }
                    }
                };
                dyn.updateItem(setParams).promise()
                    .then(function () {
                    //
                })["catch"](function (err) {
                    console.log(err);
                });
                comParams = {
                    TableName: 'match-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    UpdateExpression: 'set netComments = :com',
                    ExpressionAttributeValues: {
                        ':com': { N: (Number(coms) + 1).toString() }
                    }
                };
                dyn.updateItem(comParams).promise()
                    .then(function () {
                    //
                })["catch"](function (err) {
                    console.log(err);
                });
                putParams = {
                    TableName: 'comment-table',
                    Item: com
                };
                return [4 /*yield*/, dyn.putItem(putParams).promise()
                        .then(function () {
                        var response = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Succeeded Comment Upload',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })["catch"](function (err) {
                        console.log(err);
                        var response = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Failed Comment Upload',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })];
            case 3: return [2 /*return*/, _a.sent()];
            case 4:
                if (!(chkIp && req.action === 'put')) return [3 /*break*/, 6];
                com.charName = { S: myName };
                comParams = {
                    TableName: 'match-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    UpdateExpression: 'set netComments = :com',
                    ExpressionAttributeValues: {
                        ':com': { N: (Number(coms) + 1).toString() }
                    }
                };
                dyn.updateItem(comParams).promise()
                    .then(function () {
                    //
                })["catch"](function (err) {
                    console.log(err);
                });
                putParams = {
                    TableName: 'comment-table',
                    Item: com
                };
                return [4 /*yield*/, dyn.putItem(putParams).promise()
                        .then(function () {
                        var response = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Succeeded Comment Upload',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })["catch"](function (err) {
                        console.log(err);
                        var response = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Failed Comment Upload',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })];
            case 5: return [2 /*return*/, _a.sent()];
            case 6:
                if (!(req.action === 'delete')) return [3 /*break*/, 9];
                params_1 = {
                    TableName: 'comment-table',
                    ProjectionExpression: 'userIp',
                    Key: {
                        'commentId': { S: req.commentId }
                    }
                };
                return [4 /*yield*/, dyn.getItem(params_1).promise()
                        .then(function (data) {
                        return data['Item'];
                    })["catch"](function (err) {
                        console.log(err);
                        return;
                    })];
            case 7:
                chk = _a.sent();
                if (chk['userIp']['S'] !== event.requestContext.identity.sourceIp) {
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Forbidden Comment Deletion',
                            runtime: context
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                            'Access-Control-Allow-Credentials': true
                        }
                    };
                    return [2 /*return*/, response];
                }
                comParams = {
                    TableName: 'match-table',
                    Key: {
                        'matchId': { S: req.matchId }
                    },
                    UpdateExpression: 'set netComments = :com',
                    ExpressionAttributeValues: {
                        ':com': { N: (Number(coms) - 1).toString() }
                    }
                };
                dyn.updateItem(comParams).promise()
                    .then(function () {
                    //
                })["catch"](function (err) {
                    console.log(err);
                });
                setParams = {
                    TableName: 'comment-table',
                    Key: {
                        'commentId': { S: req.commentId }
                    }
                };
                return [4 /*yield*/, dyn.deleteItem(setParams).promise()
                        .then(function () {
                        var response = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Succeeded Comment Deletion',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })["catch"](function (err) {
                        console.log(err);
                        var response = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Failed Comment Deletion',
                                runtime: context
                            }),
                            headers: {
                                'Access-Control-Allow-Origin': 'https://stdev17.github.io',
                                'Access-Control-Allow-Credentials': true
                            }
                        };
                        return response;
                    })];
            case 8: return [2 /*return*/, _a.sent()];
            case 9: return [2 /*return*/];
        }
    });
}); };
