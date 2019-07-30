const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let req = event.body;
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

  let resCheck = check.data.message['Item'];
  let checkVote = "Not Voted";
  if (resCheck['upvoters']['L'].includes(myIp)) {
    checkVote = 'Upvoted';
  } else if (resCheck['downvoters']['L'].includes(myIp)) {
    checkVote = 'Downvoted';
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
    let resGet = get.data.message['Item'];
    let setUpvote, setDownvote;
    let upvoteValue, downvoteValue, netUpvoteValue;
    if (checkVote == 'Not Voted') {
      if (req.vote == 'up') {
        setUpvote = 'vote';
        setDownvote = 'none';
      } else {
        setUpvote = 'none';
        setDownvote = 'vote';
      }
    } else if (checkVote == 'Upvoted') {
      if (req.vote == 'up') {
        exit = true;
      } else {
        setUpvote = 'unvote';
        setDownvote = 'vote';
      }
    } else {
      if (req.vote == 'up') {
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
        }
      };
      return response;
    }
    //
    if (setUpvote == 'vote') {
      resCheck['upvoters']['L'].push(myIp);
      upvoteValue = resGet['upvotes']['N'] + 1;
      netUpvoteValue = resGet['netUpvotes']['N'] + 1;
    } else if (setUpvote == 'unvote') {
      for (let u = 0; u < resCheck['upvoters']['L'].length; u++) {
        if (resCheck['upvoters']['L'][u] == myIp) {
          resCheck['upvoters']['L'].splice(u, 1);
          upvoteValue = resGet['upvotes']['N'] - 1;
          netUpvoteValue = resGet['netUpvotes']['N'] - 1;
        }
      }
    }
    if (setDownvote == 'vote') {
      resCheck['downvoters']['L'].push(myIp);
      downvoteValue = resGet['downvotes']['N'] + 1;
      netUpvoteValue = resGet['netUpvotes']['N'] - 1;
    } else if (setDownvote == 'unvote') {
      for (let u = 0; u < resCheck['downvoters']['L'].length; u++) {
        if (resCheck['downvoters']['L'][u] == myIp) {
          resCheck['downvoters']['L'].splice(u, 1);
          downvoteValue = resGet['downvotes']['N'] - 1;
          netUpvoteValue = resGet['netUpvotes']['N'] + 1;
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
        ':net': netUpvoteValue,
        ':up': upvoteValue,
        ':down': downvoteValue
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
        })
      };
      return result;
    });

    if (updateMatch.data.message == 'Setting Votes Failed') {
      return updateMatch;
    }

    let voterParams = {
      TableName: 'voter-table',
      Key: {
        'matchId': {S: req.matchId}
      },
      UpdateExpression: 'set upvoters = :up, downvoters = :down',
      ExpressionAttributeValues: {
        ':up': resCheck['upvoters']['L'],
        ':down': resCheck['downvoters']['L']
      },
    };

    let updateVoter = await dyn.updateItem(voterParams).promise()
    .then(data => {
      result = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Vote Succeeded',
          votes: {
            up: setUpvote,
            down: setDownvote
          },
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Setting Voters Failed',
          runtime: err
        })
      };
      return result;
    });

    return updateVoter;
}