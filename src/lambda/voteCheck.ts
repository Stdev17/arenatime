import aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-2'});
const dyn = new aws.DynamoDB();

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  const req = JSON.parse(event.body);
  const myIp = event.requestContext.identity.sourceIp;

  const checkParams = {
    TableName: 'voter-table',
    Key: {
      'matchId': {S: req.matchId}
    },
    ProjectionExpression: 'upvoters, downvoters'
  };

  const check = await dyn.getItem(checkParams).promise()
  .then(data => {
    const result = {
      statusCode: 200,
      body: JSON.stringify({
        message: data,
        runtime: context
      })
    };
    return result;
  })
  .catch(err => {
    const result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Getting Item Failed',
        runtime: err
      })
    };
    return result;
  });

  const resCheck = JSON.parse(check.body)['message']['Item'];
  let checkVote = "Not Voted";
  const upv = resCheck['upvoters']['L'];
  const dov = resCheck['downvoters']['L'];
  for (const u in upv) {
    if (upv[u]['S'] == myIp) {
      checkVote = 'Upvoted';
      break;
    }
  }
  for (const d in dov) {
    if (dov[d]['S'] == myIp) {
      checkVote = 'Downvoted';
      break;
    }
  }

  const getParams = {
    TableName: 'match-table',
    ProjectionExpression: 'upvotes, downvotes, netUpvotes',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  const get = await dyn.getItem(getParams).promise()
    .then(data => {
      const result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      const result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Getting Item Failed',
          runtime: err
        })
      };
      return result;
    });

    const resGet = JSON.parse(get.body)['message']['Item'];
    let setUpvote = 'none', setDownvote = 'none';
    let upvoteValue = Number(resGet['upvotes']['N']);
    let downvoteValue = Number(resGet['downvotes']['N']);
    let netUpvoteValue = Number(resGet['netUpvotes']['N']);
    if (checkVote == 'Not Voted') {
      if (req['vote'] == 'up') {
        setUpvote = 'vote';
        setDownvote = 'none';
      } else {
        setUpvote = 'none';
        setDownvote = 'vote';
      }
    } else if (checkVote == 'Upvoted') {
      if (req['vote'] == 'up') {
        setUpvote = 'unvote';
        setDownvote = 'none';
      } else {
        setUpvote = 'unvote';
        setDownvote = 'vote';
      }
    } else {
      if (req['vote'] == 'up') {
        setUpvote = 'vote';
        setDownvote = 'unvote';
      } else {
        setUpvote = 'none';
        setDownvote = 'unvote';
      }
    }
    //
    if (setUpvote == 'vote') {
      resCheck['upvoters']['L'].push({S: myIp.toString()});
      upvoteValue += Number(1);
      netUpvoteValue += Number(1);
    } else if (setUpvote == 'unvote') {
      for (let u = 0; u < resCheck['upvoters']['L'].length; u++) {
        if (resCheck['upvoters']['L'][u]['S'] == myIp) {
          resCheck['upvoters']['L'].splice(u, 1);
          upvoteValue -= Number(1);
          netUpvoteValue -= Number(1);
          break;
        }
      }
    }
    if (setDownvote == 'vote') {
      resCheck['downvoters']['L'].push({S: myIp.toString()});
      downvoteValue += Number(1);
      netUpvoteValue -= Number(1);
    } else if (setDownvote == 'unvote') {
      for (let u = 0; u < resCheck['downvoters']['L'].length; u++) {
        if (resCheck['downvoters']['L'][u]['S'] == myIp) {
          resCheck['downvoters']['L'].splice(u, 1);
          downvoteValue -= Number(1);
          netUpvoteValue += Number(1);
          break;
        }
      }
    }

    const setParams = {
      TableName: 'match-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set netUpvotes = :net, upvotes = :up, downvotes = :down',
      ExpressionAttributeValues: {
        ':net': {N: netUpvoteValue.toString()},
        ':up': {N: upvoteValue.toString()},
        ':down': {N: downvoteValue.toString()}
      },
    };

    const updateMatch = await dyn.updateItem(setParams).promise()
    .then(data => {
      const result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      const result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Setting Votes Failed',
          runtime: err
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return result;
    });

    if (JSON.parse(updateMatch.body)['message'] == 'Setting Votes Failed') {
      return updateMatch;
    }

    const voterParams = {
      TableName: 'voter-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set upvoters = :up, downvoters = :down',
      ExpressionAttributeValues: {
        ':up': {L: resCheck['upvoters']['L']},
        ':down': {L: resCheck['downvoters']['L']}
      },
    };

    const updateVoter = await dyn.updateItem(voterParams).promise()
    .then(() => {
      const result = {
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
          'Access-Control-Allow-Credentials': true,
        }
      };
      return result;
    })
    .catch(err => {
      const result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Setting Voters Failed',
          runtime: err
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return result;
    });

    return updateVoter;
}