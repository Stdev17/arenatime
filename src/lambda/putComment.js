const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();
const char = require('../util/comment_char').char;
const uuid = require('uuid/v4');
const ubase = require('uuid-base64');

module.exports.handler = async (event, context) => {

  //req.action: put, delete

  let req = event.body;
  let com = {
    matchId: {S: req.matchId},
    commentId: {S: ubase.encode(uuid())},
    userIp: {S: event.requestContext.identity.sourceIp},
    memo: {S: req.memo}
  };

  let params = {
    TableName: 'commenter-table',
    ProjectionExpression: 'commenterIps',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  let ips = await dyn.getItem(params).promise()
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log(err);
      return;
    });

  let chk_ip = false;
  let myChar = char.slice();

  for (let i in ips) {
    let del = myChar.indexOf(ips[i]);
    myChar.splice(del, 1);
    if (i === com.userIp) {
      chk_ip = true;
      break;
    }
  }
  if (!chk_ip && myChar.length !== 0 && req.action === 'put') {
    let name = myChar[Math.floor(Math.random()*myChar.length)];
    com.name = {S: name};

    ips[com.userIp] = com.name;

    let setParams = {
      TableName: 'commenter-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set commentIps = :com',
      ExpressionAttributeValues: {
        ':com': {M: ips}
      }
    };

    dyn.updateItem(setParams).promise()
      .then(data =>{
        //
      })
      .catch(err => {
        console.log(err);
      });
    
    let putParams = {
      TableName: 'comment-table',
      Item: com
    };

    return dyn.putItem(putParams).promise()
      .then(data => {
        let response = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Succeeded Comment Upload',
            runtime: context
          }),
          headers: {
            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
            'Access-Control-Allow-Credentials': true,
          }
        };
        return response;
      })
      .catch(err => {
        console.log(err);
        let response = {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Failed Comment Upload',
            runtime: context
          }),
          headers: {
            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
            'Access-Control-Allow-Credentials': true,
          }
        };
        return response;
      });
  } else if (chk_ip && req.action === 'put') {
    com.name = {S: ips[com.userIp]};

    let putParams = {
      TableName: 'comment-table',
      Item: com
    };

    return dyn.putItem(putParams).promise()
      .then(data => {
        let response = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Succeeded Comment Upload',
            runtime: context
          }),
          headers: {
            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
            'Access-Control-Allow-Credentials': true,
          }
        };
        return response;
      })
      .catch(err => {
        console.log(err);
        let response = {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Failed Comment Upload',
            runtime: context
          }),
          headers: {
            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
            'Access-Control-Allow-Credentials': true,
          }
        };
        return response;
      });
  } else if (chk_ip && req.action === 'delete') {

  }

}