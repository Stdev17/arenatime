const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let req = JSON.parse(event.body);
  let myIp = event.requestContext.identity.sourceIp;

  let checkParams = {
    TableName: 'voter-table',
    Key: {
      'matchId': {S: req.matchId}
    },
    ProjectionExpression: 'upvoters, downvoters'
  };

  let check = await dyn.getItem(checkParams).promise()
  .then(data => {
    result = {
      statusCode: 200,
      body: JSON.stringify({
        message: data,
        runtime: context
      })
    };
    return result;
  })
  .catch(err => {
    result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Getting Item Failed',
        runtime: err
      })
    };
    return result;
  });

  let resCheck = JSON.parse(check.body)['message']['Item'];
  let checkVote = "Not Voted";
  let upv = resCheck['upvoters']['L'];
  let dov = resCheck['downvoters']['L'];
  for (let u in upv) {
    if (upv[u]['S'] == myIp) {
      checkVote = 'Upvoted';
      break;
    }
  }
  for (let d in dov) {
    if (dov[d]['S'] == myIp) {
      checkVote = 'Downvoted';
      break;
    }
  }

  let getParams = {
    TableName: 'match-table',
    ProjectionExpression: 'upvotes, downvotes, netUpvotes',
    Key: {
      'matchId': {S: req.matchId}
    }
  };

  let get = await dyn.getItem(getParams).promise()
    .then(data => {
      result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Getting Item Failed',
          runtime: err
        })
      };
      return result;
    });

    let exit = false;
    let resGet = JSON.parse(get.body)['message']['Item'];
    let setUpvote, setDownvote;
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
        exit = true;
      } else {
        setUpvote = 'unvote';
        setDownvote = 'vote';
      }
    } else {
      if (req['vote'] == 'up') {
        setUpvote = 'vote';
        setDownvote = 'unvote';
      } else {
        exit = true;
      }
    }
    //
    if (exit) {
      let response = {
        statusCode: 200,
        body: {
          message: "Same votes exists."
        },
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return response;
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

    let setParams = {
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

    let updateMatch = await dyn.updateItem(setParams).promise()
    .then(data => {
      result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      result = {
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

    let voterParams = {
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

    let updateVoter = await dyn.updateItem(voterParams).promise()
    .then(data => {
      result = {
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
      result = {
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