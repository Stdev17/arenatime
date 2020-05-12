import aws = require('aws-sdk');
import athenaClient = require('athena-client');
import primeChar from '../util/prime';

aws.config.update({ region: 'ap-northeast-2' });
const dyn = new aws.DynamoDB();
let table = 'match-table';

function setId(req: any): number {
  let id = 1;
  const deck = req.deck;
  for (const tmp in deck) {
    id *= primeChar[deck[tmp]];
  }
  if (id === NaN) {
    return 1;
  }
  return id;
}

const clientConfig = {
  bucketUri: 's3://aws-athena-query-results-527044138162-ap-northeast-2/',
  database: 'aggregated',
};
const awsConfig = {
  region: 'ap-northeast-2',
};
const athena = athenaClient.createClient(clientConfig, awsConfig);

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {
  const req = JSON.parse(event.queryStringParameters[0]);
  const count = Object.keys(req.deck).length;

  if (
    (req.deckType !== 'defense' && req.deckType !== 'attack') ||
    (req.matchResult !== 'attackWin' &&
      req.matchResult !== 'defenseWin' &&
      req.matchResult !== 'all') ||
    (req.arena !== 'all' &&
      req.arena !== 'battleArena' &&
      req.arena !== 'princessArena') ||
    (count > 3 && count < 2)
  ) {
    const result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Parsing Failed',
        runtime: 'err',
      }),
    };
    return result;
  }

  let queryString = '';

  const id = setId(req);

  if (req.deckType === 'defense' && count === 2) {
    queryString =
      `select matchid from dated_matches where contains(defenseduo, ` +
      id +
      `) and arena <> '` +
      req.arena +
      `' and matchresult <> '` +
      req.matchResult +
      `' limit 50`;
  } else if (req.deckType === 'defense' && count === 3) {
    queryString =
      `select matchid from dated_matches where contains(defensetrio, ` +
      id +
      `) and arena <> '` +
      req.arena +
      `' and matchresult <> '` +
      req.matchResult +
      `' limit 50`;
  } else if (req.deckType === 'attack' && count === 2) {
    queryString =
      `select matchid from dated_matches where contains(attackduo, ` +
      id +
      `) and arena <> '` +
      req.arena +
      `' and matchresult <> '` +
      req.matchResult +
      `' limit 50`;
  } else if (req.deckType === 'attack' && count === 3) {
    queryString =
      `select matchid from dated_matches where contains(attacktrio, ` +
      id +
      `) and arena <> '` +
      req.arena +
      `' and matchresult <> '` +
      req.matchResult +
      `' limit 50`;
  }

  let query;
  try {
    query = await athena.execute(queryString).toPromise();
  } catch (err) {
    const result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Query Failed',
        runtime: err,
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      },
    };
    return result;
  }

  const queries: any[] = query['records'];
  let matches: any[] = [];
  matches = [];
  let error = false;

  for (const m in queries) {
    const params = {
      TableName: table,
      ProjectionExpression:
        'attackDeck, attackStar, attackPower, uploadedDate, defenseDeck, defenseStar, defensePower, memo, upvotes, downvotes, matchId, matchResult, netComments',
      Key: {
        matchId: { S: queries[m]['matchid'] },
      },
    };
    await dyn
      .getItem(params)
      .promise()
      .then(data => {
        if (
          data['Item'] !== undefined &&
          data['Item']['attackDeck'] !== undefined
        ) {
          matches.push(data['Item']);
        }
        return;
      })
      .catch(() => {
        error = true;
        return;
      });
  }
  if (error) {
    const result = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Getting Items Failed',
        runtime: context,
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      },
    };
    return result;
  } else {
    const result = {
      statusCode: 200,
      body: JSON.stringify({
        message: matches,
        runtime: context,
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      },
    };
    return result;
  }
};

/** 유닛 테스트에 호출되는 함수 */
async function test(event: any, context: any, args: string[]): Promise<any> {
  table = args[0];
  return await handler(event, context);
}

export default test;
