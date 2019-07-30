const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let req = event.queryStringParameters[0];
  let myIp = event.requestContext.identity.sourceIp;

  let params = {
    TableName: 'match-table',
    ProjectionExpression: 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, imagePath, matchId, matchResult',
    Key: {
      'matchId': {S: req}
    }
  };

  let get = await dyn.getItem(params).promise()
    .then(data => {
      let result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      let result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Getting Item Failed',
          runtime: err
        })
      };
      return result;
    });

    if (get.body.message === 'Getting Item Failed') {
      return get;
    }

    let voteParams = {
      TableName: 'voter-table',
      Key: {
        'matchId': {S: req}
      },
      ProjectionExpression: 'upvoters, downvoters'
    };

    let voters = await dyn.getItem(voteParams).promise()
    .then(data => {
      let result = {
        statusCode: 200,
        body: JSON.stringify({
          message: data,
          runtime: context
        })
      };
      return result;
    })
    .catch(err => {
      let result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Getting Voters Failed',
          runtime: err
        })
      };
      return result;
    });

    let voteParsed = JSON.parse(voters.body);

    if (voteParsed['message'] === 'Getting Voters Failed') {
      return voters;
    }

    let resVote = voteParsed['message']['Item'];
    let checkVote = "Not Voted";
    if (resVote['upvoters']['L'].includes(myIp)) {
      checkVote = 'Upvoted';
    } else if (resVote['downvoters']['L'].includes(myIp)) {
      checkVote = 'Downvoted';
    }

    let result = {
      statusCode: 200,
      body: JSON.stringify({
        message: JSON.parse(get.body)['message'],
        vote: checkVote,
        runtime: context
      })
    };



    return result;
}