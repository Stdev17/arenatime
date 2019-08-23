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
  if (id === NaN) {
    return 1;
  }
  return id;
}


module.exports.handler = async (event, context, callback) => {

  let req = JSON.parse(event.queryStringParameters[0]);
  let deckId = setId(req);

  

  let params = {
    TableName: 'match-table',
    ExpressionAttributeValues: {
      ':deckId': {N: deckId.toString()}
    },
    Limit: 5
  };

  if (req.arena === 'battleArena') {
    params.ExpressionAttributeValues[':arena'] = {S: 'princessArena'};
  }
  if (req.arena === 'princessArena') {
    params.ExpressionAttributeValues[':arena'] = {S: 'battleArena'};
  }
  if (req.arena === 'all') {
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
      params.ExpressionAttributeValues[':upper'] = {N: '100000'};
      params.ExpressionAttributeValues[':lower'] = {N: '-1'};
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

  if (req.target === 'defense' && req.sort === 'netUpvotes') {
    params.IndexName = 'defenseVotes';
    if (req.result === 'victory') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'defenseDeckId = :deckId';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and uploadedDate > :date and arena <> :arena and matchResult <> :result';
  }

  if (req.target === 'attack' && req.sort === 'netUpvotes') {
    params.IndexName = 'attackVotes';
    if (req.result === 'defeat') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'attackDeckId = :deckId';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and uploadedDate > :date and arena <> :arena and matchResult <> :result';
  }

  if (req.target === 'defense' && req.sort === 'latest') {
    params.IndexName = 'defenseDate';
    if (req.result === 'victory') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'defenseDeckId = :deckId and uploadedDate > :date';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'defensePower > :lower and defensePower < :upper and arena <> :arena and matchResult <> :result';
  }

  if (req.target === 'attack' && req.sort === 'latest') {
    params.IndexName = 'attackDate';
    if (req.result === 'defeat') {
      params.ExpressionAttributeValues[':result'] = {S: 'attackWin'};
    } else if (req.result === 'all') {
      params.ExpressionAttributeValues[':result'] = {S: 'all'};
    } else {
      params.ExpressionAttributeValues[':result'] = {S: 'defenseWin'};
    }
    params.ScanIndexForward = false;
    params.KeyConditionExpression = 'attackDeckId = :deckId and uploadedDate > :date';
    params.ProjectionExpression = 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments';
    params.FilterExpression = 'attackPower > :lower and attackPower < :upper and arena <> :arena and matchResult <> :result';
  }

  let queries = [];

  let get = await dyn.query(params, async function continueQuery(err, data) {
    if (err) {
      let result = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Query Failed',
          runtime: err
        })
      };
      return result;
    } else {
      if (queries.length === 0 && data['Count'] !== 0) {
        queries.push(data);
      } else if (data['Items'][0] !== undefined) {
        let check = false;
        for (let i in queries) {
          if (queries[i]['Items'][0]['matchId']['S'] === data['Items'][0]['matchId']['S']) {
            check = true;
          }
        }
        if (!check) {
          queries.push(data);
        }
      }
      if (data.LastEvaluatedKey) {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        let get = await dyn.query(params, continueQuery).promise();
        return get;
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Success',
            runtime: context
          })
        };
      }
    }
  }).promise();

  let succeed = false;

  let fuck = await (async _ => {
    await timeout(800);
    return finished();
  })();

  if (succeed) {
    let res = [];
    let buf = [];
    let tmp;
    for (let i in queries) {
      for (let j in queries[i]['Items']) {
        buf.push(queries[i]['Items'][j]);
      }
    }
    for (let i = 0; i < buf.length; i++) {
      if (i % 5 === 0) {
        tmp = {'Items': []};
      }
      tmp['Items'].push(buf[i]);
      if (i % 5 === 4) {
        res.push(tmp);
      }
    }
    if (buf.length % 5 !== 0) {
      res.push(tmp);
    }
    fuck = {
      statusCode: 200,
      body: JSON.stringify({
        message: res,
        runtime: context
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
  }

  return fuck;

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function finished() {
    if (queries.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Deck Not Found',
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
    }
    succeed = true;
    return;
  }

}