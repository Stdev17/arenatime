import aws = require('aws-sdk');
import char from '../util/comment_char';
import uuid = require('uuid/v4');
import ubase from '../util/ubase';
import moment from 'moment';
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  //req.action: put, delete

  const req = JSON.parse(event.body);

  const com: any = {
    matchId: {S: req.matchId},
    commentId: {S: ubase(uuid())},
    userIp: {S: event.requestContext.identity.sourceIp},
    memo: {S: req.memo},
    uploadedDate: {S: moment().add(9, 'hours').format("YYYY-MM-DD HH:mm:ss")}
  };

  const params = {
    TableName: 'commenter-table',
    ProjectionExpression: 'commentIps',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  let ips: any = await dyn.getItem(params).promise()
    .then(data => {
      return data['Item'];
    })
    .catch(err => {
      console.log(err);
      return;
    });
  
  let tmp: any = {};
  tmp = {};
  if (ips === undefined) {
    ips = {};
  } else {
    for (const i in ips.commentIps['M']) {
      tmp[i] = {S: ips.commentIps['M'][i]['S']};
    }
  }
  ips = tmp;

  const getComments = {
    TableName: 'match-table',
    ProjectionExpression: 'netComments',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  let coms: any = await dyn.getItem(getComments).promise()
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

  let chkIp = false;
  let myName = "";
  let myChar = char.slice();
  myChar = myChar;

  for (const i in ips) {
    const del = myChar.indexOf(ips[i]['S']);
    myChar.splice(del, 1);
    if (i === com.userIp['S']) {
      chkIp = true;
      myName = ips[i]['S'];
      break;
    }
  }
  if (!chkIp && myChar.length !== 0 && req.action === 'put') {
    const name = myChar[Math.floor(Math.random()*myChar.length)];
    com['charName'] = {S: name};

    ips[com.userIp['S']] = {S: name};

    const setParams = {
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
      .then(() =>{
        //
      })
      .catch(err => {
        console.log(err);
      });

    const comParams = {
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
      .then(() => {
        //
      })
      .catch(err => {
        console.log(err);
      });
    
    const putParams = {
      TableName: 'comment-table',
      Item: com
    };

    return await dyn.putItem(putParams).promise()
      .then(() => {
        const response = {
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
        const response = {
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
  } else if (chkIp && req.action === 'put') {
    com.charName = {S: myName};

    const comParams = {
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
      .then(() =>{
        //
      })
      .catch(err => {
        console.log(err);
      });

    const putParams = {
      TableName: 'comment-table',
      Item: com
    };

    return await dyn.putItem(putParams).promise()
      .then(() => {
        const response = {
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
        const response = {
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
    const params = {
      TableName: 'comment-table',
      ProjectionExpression: 'userIp',
      Key: {
        'commentId': {S: req.commentId}
      }
    };
  
    const chk: any = await dyn.getItem(params).promise()
      .then(data => {
        return data['Item'];
      })
      .catch(err => {
        console.log(err);
        return;
      });

    if (chk['userIp']['S'] !== event.requestContext.identity.sourceIp) {
      const response = {
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
    
    const comParams = {
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
      .then(() =>{
        //
      })
      .catch(err => {
        console.log(err);
      });

    const setParams = {
      TableName: 'comment-table',
      Key: {
        'commentId': {S: req.commentId}
      }
    };

    return await dyn.deleteItem(setParams).promise()
      .then(() => {
        const response = {
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
        const response = {
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