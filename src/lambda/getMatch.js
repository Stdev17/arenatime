const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();

module.exports.handler = async (event, context) => {

  let req = event.queryStringParameters[0];

  let params = {
    TableName: 'match-table',
    ProjectionExpression: 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, imagePath, matchId, matchResult',
    Key: {
      'matchId': {S: req}
    }
  };

  let get = await dyn.getItem(params).promise()
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
          message: 'GetItem Failed',
          runtime: err
        })
      };
      return result;
    });

    return get;
}