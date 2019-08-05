const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();
const athenaExpress = require('athena-express');

const primeChar = require('../util/prime').prime;

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

const config = {
	aws,
	db: 'matchdata',
	getStats: true
};
const athena = new athenaExpress(config);

module.exports.handler = async (event, context) => {
  let req = JSON.parse(event.queryStringParameters[0]);
  let count = 0;

  for (let c in req.deck) {
    count += 1;
  }

  if ((req.deckType !== 'defense' && req.deckType !== 'attack') || (req.matchResult !== "attackWin" && req.matchResult !== 'defenseWin') || (req.arena !== 'all' && req.arena !== 'battleArena' && req.arena !== 'princessArena') || (count > 3 && count < 2)) {
    let result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Parsing Failed',
        runtime: err
      })
    };
    return result;
  }

  let queryString = "";

  let id = setId(req);

  if (req.deckType === 'defense' && count === 2) {
    queryString = `select matchid from matchtable where contains(defensetduo, `+id+`) and arena <> '`+req.arena+`' and matchresult = '`+req.matchResult+`' limit 100`;
  } else if (req.deckType === 'defense' && count === 3) {
    queryString = `select matchid from matchtable where contains(defensetrio, `+id+`) and arena <> '`+req.arena+`' and matchresult = '`+req.matchResult+`' limit 100`;
  } else if (req.deckType === 'attack' && count === 2) {
    queryString = `select matchid from matchtable where contains(attackduo, `+id+`) and arena <> '`+req.arena+`' and matchresult = '`+req.matchResult+`' limit 100`;
  } else if (req.deckType === 'attack' && count === 3) {
    queryString = `select matchid from matchtable where contains(attacktrio, `+id+`) and arena <> '`+req.arena+`' and matchresult = '`+req.matchResult+`' limit 100`;
  }

  let query;
  try {
    query = await athena.query(queryString);
  } catch (err) {
    let result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Query Failed',
        runtime: err
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
    return result;
  }

  let queries = query['Items'];
  let matches = [];
  let error = false;

  for (let m in queries) {
    let params = {
      TableName: 'match-table',
      ProjectionExpression: 'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult',
      Key: {
        'matchId': {S: queries[m]['matchid']}
      }
    };
    let nothing = await dyn.getItem(params).promise()
    .then(data => {
      if (data['Item'] !== undefined) {
        matches.push(data['Item']);
      }
    })
    .catch(err => {
      error = true;
    });
  }

  if (error) {
    let result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Getting Items Failed',
        runtime: context
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
    return result;
  } else {
    let result = {
      statusCode: 200,
      body: JSON.stringify({
        message: matches,
        runtime: context
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
    return result;
  }
}