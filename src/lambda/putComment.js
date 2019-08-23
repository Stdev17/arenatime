const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();
const char = require('../util/comment_char').char;
const uuid = require('uuid/v4');
const ubase = require('uuid-base64');
const moment = require('moment');

module.exports.handler = async (event, context) => {

  //req.action: put, delete

  let req = JSON.parse(event.body);

  let com = {
    matchId: {S: req.matchId},
    commentId: {S: ubase.encode(uuid())},
    userIp: {S: event.requestContext.identity.sourceIp},
    memo: {S: req.memo},
    uploadedDate: {S: moment().add(9, 'hours').format("YYYY-MM-DD HH:mm:ss")}
  };

  let params = {
    TableName: 'commenter-table',
    ProjectionExpression: 'commentIps',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  let ips = await dyn.getItem(params).promise()
    .then(data => {
      return data['Item'];
    })
    .catch(err => {
      console.log(err);
      return;
    });
  
  let tmp = {};
  if (ips === undefined) {
    ips = {};
  } else {
    for (let i in ips.commentIps['M']) {
      tmp[i] = {S: ips.commentIps['M'][i]['S']};
    }
  }
  ips = tmp;

  let getComments = {
    TableName: 'match-table',
    ProjectionExpression: 'netComments',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  let coms = await dyn.getItem(getComments).promise()
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log(err);
      return;
    });
  
  if (coms['Item']['netComments'] !== undefined) {
    coms = coms['Item']['netComments']['N'];
  } else {
    coms = 0;
  }

  let chk_ip = false;
  let thatIp
  let myName = "";
  let myChar = char.slice();

  for (let i in ips) {
    let del = myChar.indexOf(ips[i]['S']);
    myChar.splice(del, 1);
    if (i === com.userIp['S']) {
      chk_ip = true;
      myName = ips[i]['S'];
      break;
    }
  }
  if (!chk_ip && myChar.length !== 0 && req.action === 'put') {
    let name = myChar[Math.floor(Math.random()*myChar.length)];
    com.charName = {S: name};

    ips[com.userIp['S']] = {S: name};

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

    let comParams = {
      TableName: 'match-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set netComments = :com',
      ExpressionAttributeValues: {
        ':com': {N: (Number(coms)+1).toString()}
      }
    };

    dyn.updateItem(comParams).promise()
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
    com.charName = {S: myName};

    let comParams = {
      TableName: 'match-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set netComments = :com',
      ExpressionAttributeValues: {
        ':com': {N: (Number(coms)+1).toString()}
      }
    };

    dyn.updateItem(comParams).promise()
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
  } else if (req.action === 'delete') {
    let params = {
      TableName: 'comment-table',
      ProjectionExpression: 'userIp',
      Key: {
        'commentId': {S: req.commentId}
      }
    };
  
    let chk = await dyn.getItem(params).promise()
      .then(data => {
        return data['Item'];
      })
      .catch(err => {
        console.log(err);
        return;
      });

    if (chk['userIp']['S'] !== event.requestContext.identity.sourceIp) {
      let response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Forbidden Comment Deletion',
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return response;
    }
    
    let comParams = {
      TableName: 'match-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set netComments = :com',
      ExpressionAttributeValues: {
        ':com': {N: (Number(coms)-1).toString()}
      }
    };

    dyn.updateItem(comParams).promise()
      .then(data =>{
        //
      })
      .catch(err => {
        console.log(err);
      });

    let setParams = {
      TableName: 'comment-table',
      Key: {
        'commentId': {S: req.commentId}
      }
    };

    return dyn.deleteItem(setParams).promise()
      .then(data => {
        let response = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Succeeded Comment Deletion',
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
            message: 'Failed Comment Deletion',
            runtime: context
          }),
          headers: {
            'Access-Control-Allow-Origin': 'https://stdev17.github.io',
            'Access-Control-Allow-Credentials': true,
          }
        };
        return response;
      })
  }
}