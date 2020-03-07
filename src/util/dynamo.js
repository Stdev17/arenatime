"use strict";
exports.__esModule = true;
var aws = require("aws-sdk");
aws.config.update({ region: 'ap-northeast-2' });
var dyn = new aws.DynamoDB();
exports.dynamoQuery = function (params) {
    return dyn.query(params).promise();
};
