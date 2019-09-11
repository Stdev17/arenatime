import datePrefix from '../util/datePrefix';
import char from '../util/char';
import primeChar from '../util/prime';
import aws = require('aws-sdk');
import moment from 'moment';
import uuid = require('uuid/v4');
import comb from '../util/comb';
import {gzip} from 'node-gzip';
import ubase from '../util/ubase';

aws.config.update({region: 'ap-northeast-2'});
const s3 = new aws.S3();
const dyn = new aws.DynamoDB();

function validateProperties(f: any): boolean {
  //Power
  if (!(f.attackPower > 100) && f.attackPower !== 0) {
    return false;
  }
  if (!(f.attackPower < 70000)) {
    return false;
  }
  if (!(f.defensePower > 100) && f.defensePower !== 0) {
    return false;
  }
  if (!(f.defensePower < 70000)) {
    return false;
  }
  //Arena
  if (f.arena != "battleArena" && f.arena != "princessArena") {
    return false;
  }
  //result
  if (f.matchResult != "attackWin" && f.matchResult != "defenseWin") {
    return false;
  }
  return true;
}

function validateStarAndDeck(f: any): boolean {
  if (f.attackNum > 5 || f.attackNum < 1 || f.defenseNum > 5 || f.defenseNum < 1) {
    return false;
  }
  let aStarCount = 0;
  let aDeckCount = 0;
  let dStarCount = 0;
  let dDeckCount = 0;
  const a = f.attackStar;
  for (const tmp in a) {
    if (a[tmp] < 1 || (a[tmp] !== 9 && a[tmp] > 5)) {
      return false;
    }
    aStarCount += 1;
  }
  const d = f.defenseStar;
  for (const tmp in d) {
    if (a[tmp] < 1 || (a[tmp] !== 9 && a[tmp] > 5)) {
      return false;
    }
    dStarCount += 1;
  }
  const aDeck = f.attackDeck;
  for (const t in aDeck) {
    const tmp = aDeck[t];
    if (!char.includes(tmp)) {
      console.log(tmp);
      return false;
    }
    if (tmp != "Empty") {
      aDeckCount += 1;
    }
  }
  const dDeck = f.defenseDeck;
  for (const t in dDeck) {
    const tmp = dDeck[t];
    if (!char.includes(tmp)) {
      console.log(tmp);
      return false;
    }
    if (tmp != "Empty") {
      dDeckCount += 1;
    }
  }
  if (f.attackNum != aStarCount || aStarCount != aDeckCount || aDeckCount != f.attackNum) {
    return false;
  }
  if (f.defenseNum != dStarCount || dStarCount != dDeckCount || dDeckCount != f.defenseNum) {
    return false;
  }
  return true;
}

function getDuo(d: any): number[] {
  let size = 0;
  let deck = [];
  deck = [];
  for (const tmp in d) {
    deck.push(primeChar[d[tmp]]);
    size += 1;
  }
  if (size < 2) {
    return [];
  }
  const du = comb(deck, 2);
  let duo = [];
  duo = [];
  let a;
  while (a = du.next()) {
    let sum = 1;
    while (a.length > 0) {
      sum *= a.pop();
    }
    duo.push(sum);
  }
  return duo;
}

function getTrio(d: any): number[] {
  let size = 0;
  let deck = [];
  deck = [];
  for (const tmp in d) {
    deck.push(primeChar[d[tmp]]);
    size += 1;
  }
  if (size < 3) {
    return [];
  }
  const t = comb(deck, 3);
  let trio = [];
  trio = [];
  let a;
  while (a = t.next()) {
    let sum = 1;
    while (a.length > 0) {
      sum *= a.pop();
    }
    trio.push(sum);
  }
  return trio;
}

function getItem(p: any): any {
  let attd: any = {};
  attd = {};
  const aDeck = p.attackDeck;
  for (const a in aDeck) {
    attd[a] = {S: aDeck[a]};
  }
  let defd: any = {};
  defd = {};
  const dDeck = p.defenseDeck;
  for (const d in dDeck) {
    defd[d] = {S: dDeck[d]};
  }
  let atts: any = {};
  atts = {};
  const aStar = p.attackStar;
  for (const a in aStar) {
    atts[a] = {N: aStar[a].toString()};
  }
  let defs: any = {};
  defs = {};
  const dStar = p.defenseStar;
  for (const d in dStar) {
    defs[d] = {N: dStar[d].toString()};
  }
  let aDuo = [];
  aDuo = [];
  for (const a in p.attackDuo) {
    aDuo.push({N: p.attackDuo[a].toString()});
  }
  let dDuo = [];
  dDuo = [];
  for (const d in p.defenseDuo) {
    dDuo.push({N: p.defenseDuo[d].toString()});
  }
  let aTrio = [];
  aTrio = [];
  for (const a in p.attackTrio) {
    aTrio.push({N: p.attackTrio[a].toString()});
  }
  let dTrio = [];
  dTrio = [];
  for (const d in p.defenseTrio) {
    dTrio.push({N: p.defenseTrio[d].toString()});
  }
  const temp = {
    matchResult: {S: p.matchResult},
    arena: {S: p.arena},
    memo: {S: p.memo},
    attackPower: {N: p.attackPower.toString()},
    attackDeck: {M: attd},
    attackStar: {M: atts},
    defensePower: {N: p.defensePower.toString()},
    defenseDeck: {M: defd},
    defenseStar: {M: defs},
    imagePath: {S: p.imagePath},
    matchId: {S: p.matchId},
    uploadedDate: {S: p.uploadedDate},
    attackDeckId: {N: p.attackDeckId.toString()},
    defenseDeckId: {N: p.defenseDeckId.toString()},
    attackDuo: {L: aDuo},
    attackTrio: {L: aTrio},
    defenseDuo: {L: dDuo},
    defenseTrio: {L: dTrio},
    netUpvotes: {N: p.netUpvotes.toString()},
    upvotes: {N: p.upvotes.toString()},
    downvotes: {N: p.downvotes.toString()},
    userIp: {S: p.userIp},
    netComments: {N: p.netComments.toString()}
  };
  return temp;
}

const parseData = function(req: any): any {

  if (!validateProperties(req)) {
    return {};
  }
  if (!validateStarAndDeck(req)) {
    return {};
  }

  if (req.memo == "") {
    req.memo = "PlaceHolder";
  }

  req.matchId = ubase(uuid());
  req.uploadedDate = moment().add(9, 'hours').format("YYYY-MM-DD HH:mm:ss");
  let attackDeckId = 1;
  let defenseDeckId = 1;
  for (const tmp in req.attackDeck) {
    attackDeckId *= primeChar[req.attackDeck[tmp]];
  }
  for (const tmp in req.defenseDeck) {
    defenseDeckId *= primeChar[req.defenseDeck[tmp]];
  }
  req.attackDeckId = attackDeckId;
  req.defenseDeckId = defenseDeckId;

  req.attackDuo = getDuo(req.attackDeck);
  req.attackTrio = getTrio(req.attackDeck);
  req.defenseDuo = getDuo(req.defenseDeck);
  req.defenseTrio = getTrio(req.defenseDeck);

  req.netUpvotes = 0;
  req.upvotes = 0;
  req.downvotes = 0;

  req.netComments = 0;

  return req;
}

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  const request = JSON.parse(event.body);
  const parsed = parseData(request);
  if (parsed.downvotes === undefined) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: "parse error",
        runtime: context
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://stdev17.github.io',
        'Access-Control-Allow-Credentials': true,
      }
    };
    return response;
  }
  if (parsed.imagePath === undefined) {
    parsed.imagePath = 'PlaceHolder';
  }

  parsed.userIp = event.requestContext.identity.sourceIp;
  const item = getItem(parsed);
  //
  const dataParams = {
    TableName: "match-table",
    Item: item
  };
  (async (): Promise<any> => {
  await dyn.putItem(dataParams, (err) => {
    if (err) {
      const response = {
        statusCode: 400,
        body: JSON.stringify({
          message: err,
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      console.log(item);
      console.log(err);
      return response;
    } else {
      return;
    }
  });
  })();

  const vote = {
    matchId: parsed.matchId,
    upvoters: [],
    downvoters: []
  };
  const voteParams = {
    TableName: "voter-table",
    Item: {
      matchId: {S: vote.matchId},
      upvoters: {L: vote.upvoters},
      downvoters: {L: vote.downvoters}
    }
  };
  (async (): Promise<any> => {
  await dyn.putItem(voteParams, (err) => {
    if (err) {
      const response = {
        statusCode: 400,
        body: JSON.stringify({
          message: err,
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      console.log(err);
      return response;
    } else {
      return;
    }
  });
  })();

  const filePath = datePrefix();
  const fileName = parsed.matchId + ".gz";
  const fileFullName = filePath + fileName;
  const fileFullPath = 'data/' + fileFullName;

  const z: any = new (Buffer.from(JSON.stringify(parsed)) as any);
  const gz = await gzip(z);

  const params = {
    Bucket: 'priconne-arenatime',
    Body: gz,
    Key: fileFullPath,
    ContentType: 'application/json',
    ContentEncoding: 'gzip'
  };
  

  return s3.putObject(params).promise()
    .then(() => {
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Succeeded Data Upload',
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return response;
    })
    .catch(() => {
      const response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Upload Failed',
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      return response;
    });
}