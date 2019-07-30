const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();
const char = require('../util/char').char;
const primeChar = require('../util/prime').prime;
const moment = require('moment');

function setId(req) {
  let id = 1;
  for (let tmp in req.deck) {
    id *= primeChar[req.deck[tmp]];
  }
  return id;
}


module.exports.handler = async (event, context) => {

  let req = JSON.parse(event.queryStringParameters[0]);
  let myIp = event.requestContext.identity.sourceIp;
  let deckId = setId(req);

  let params = {
    TableName: 'match-table',
    ExpressionAttributeValues: {
      ':deckId': {N: deckId.toString()}
    }
  };

  if (req.arena == 'battleArena') {
    params.ExpressionAttributeValues[':arena'] = {S: 'princessArena'};
  }
  if (req.arena == 'princessArena') {
    params.ExpressionAttributeValues[':arena'] = {S: 'battleArena'};
  }
  if (req.arena == 'all') {
    params.ExpressionAttributeValues[':arena'] = {S: 'all'};
  }

  let date;
  switch (req.date) {
    case "all":
      date = moment().subtract(5, 'years').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    case "week":
      date = moment().subtract(7, 'days').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    case "month":
      date = moment().subtract(30, 'days').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    case "season":
      date = moment().subtract(90, 'days').format("YYYY-MM-DD HH:mm:ss");
      params.ExpressionAttributeValues[':date'] = {S: date};
      break;
    default:
      break;
  }

  switch (req.power) {
    case "all":
      params.ExpressionAttributeValues[':upper'] = {N: '80000'};
      params.ExpressionAttributeValues[':lower'] = {N: '50'};
      break;
    case ">55000":
      params.ExpressionAttributeValues[':upper'] = {N: '80000'};
      params.ExpressionAttributeValues[':lower'] = {N: '55000'};
      break;
    case ">50000":
      params.ExpressionAttributeValues[':upper'] = {N: '55000'};
      params.ExpressionAttributeValues[':lower'] = {N: '50000'};
      break;
    case ">45000":
      params.ExpressionAttributeValues[':upper'] = {N: '50000'};
      params.ExpressionAttributeValues[':lower'] = {N: '45000'};
      break;
    case ">40000":
      params.ExpressionAttributeValues[':upper'] = {N: '45000'};
      params.ExpressionAttributeValues[':lower'] = {N: '40000'};
      break;
    case "<40000":
      params.ExpressionAttributeValues[':upper'] = {N: '40000'};
      params.ExpressionAttributeValues[':lower'] = {N: '50'};
      break;
    default:
      break;
  }

  if (req.target == 'defense' && req.sort == 'netUpvotes') {
    params.IndexName = 'defenseVotes';
    if (req.result == 'defeat') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'defenseDeckId = :deckId';
    params.ProjectionExpression = 'attackDeck, attackStar, uploadedDate, defenseDeck, defenseStar, upvotes, downvotes, matchId, matchResult';
    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and uploadedDate > :date and arena <> :arena and matchResult = :result';
  }

  if (req.target == 'attack' && req.sort == 'netUpvotes') {
    params.IndexName = 'attackVotes';
    if (req.result == 'victory') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'attackDeckId = :deckId';
    params.ProjectionExpression = 'attackDeck, attackStar, uploadedDate, defenseDeck, defenseStar, upvotes, downvotes, matchId, matchResult';
    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and uploadedDate > :date and arena <> :arena and matchResult = :result';
  }

  if (req.target == 'defense' && req.sort == 'latest') {
    params.IndexName = 'defenseDate';
    if (req.result == 'defeat') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'defenseDeckId = :deckId and uploadedDate > :date';
    params.ProjectionExpression = 'attackDeck, attackStar, uploadedDate, defenseDeck, defenseStar, upvotes, downvotes, matchId, matchResult';
    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and arena <> :arena and matchResult = :result';
  }

  if (req.target == 'attack' && req.sort == 'latest') {
    params.IndexName = 'attackDate';
    if (req.result == 'victory') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'attackDeckId = :deckId and uploadedDate > :date';
    params.ProjectionExpression = 'attackDeck, attackStar, uploadedDate, defenseDeck, defenseStar, upvotes, downvotes, matchId, matchResult';
    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and arena <> :arena and matchResult = :result';
  }


  let get = await dyn.query(params).promise()
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
          message: 'Query Failed',
          runtime: err
        })
      };
      return result;
    });

    return result;
}