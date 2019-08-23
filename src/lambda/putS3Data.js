const datePrefix = require('../util/datePrefix');
const char = require('../util/char').char;
const primeChar = require('../util/prime').prime;

const aws = require('aws-sdk');
const s3 = new aws.S3();
const dyn = new aws.DynamoDB();
const moment = require('moment');
const uuid = require('uuid/v4');
const comb = require('js-combinatorics');
const {gzip, ungzip} = require('node-gzip');
const ubase = require('uuid-base64');

let parseData = function(req) {

  if (!validateProperties(req)) {
    return {};
  }
  if (!validateStarAndDeck(req)) {
    return {};
  }

  if (req.memo == "") {
    req.memo = "PlaceHolder";
  }

  req.matchId = ubase.encode(uuid());
  req.uploadedDate = moment().format("YYYY-MM-DD HH:mm:ss");
  let attackDeckId = 1;
  let defenseDeckId = 1;
  for (let tmp in req.attackDeck) {
    attackDeckId *= primeChar[req.attackDeck[tmp]];
  }
  for (let tmp in req.defenseDeck) {
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

  req.commenters = [];
  req.comments = 0;

  return req;
}

module.exports.handler = async (event, context) => {
  let response = {};
  let skip = true;
  let request = JSON.parse(event.body);
  let parsed = parseData(request);
  if (parsed.downvotes === undefined) {
    let response = {
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
  let item = getItem(parsed);
  //
  let dataParams = {
    TableName: "match-table",
    Item: item
  };
  (async _ => {
  let dataSend = await dyn.putItem(dataParams, (err, data) => {
    if (err) {
      let response = {
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

  let vote = {
    matchId: parsed.matchId,
    upvoters: [],
    downvoters: []
  };
  let voteParams = {
    TableName: "voter-table",
    Item: {
      matchId: {S: vote.matchId},
      upvoters: {L: vote.upvoters},
      downvoters: {L: vote.downvoters}
    }
  };
  (async _ => {
  let voteSend = await dyn.putItem(voteParams, (err, data) => {
    if (err) {
      let response = {
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

  let filePath = datePrefix();
  let fileName = parsed.matchId + ".gz";
  let fileFullName = filePath + fileName;
  let fileFullPath = 'data/' + fileFullName;

  let gz = await gzip(new Buffer.from(JSON.stringify(parsed)));

  let params = {
    Bucket: 'priconne-arenatime',
    Body: gz,
    Key: fileFullPath,
    ContentType: 'application/json',
    ContentEncoding: 'gzip'
  };
  

  return s3.putObject(params).promise()
    .then(data => {
      let response = {
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
    .catch(err => {
      let response = {
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

function validateProperties(f) {
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

function validateStarAndDeck(f) {
  if (f.attackNum > 5 || f.attackNum < 1 || f.defenseNum > 5 || f.defenseNum < 1) {
    return false;
  }
  let aStarCount = 0;
  let aDeckCount = 0;
  let dStarCount = 0;
  let dDeckCount = 0;
  let a = f.attackStar;
  for (let tmp in a) {
    if (tmp < 1 || (tmp !== 9 && tmp > 5)) {
      return false;
    }
    aStarCount += 1;
  }
  let d = f.defenseStar;
  for (let tmp in d) {
    if (tmp < 1 || (tmp !== 9 && tmp > 5)) {
      return false;
    }
    dStarCount += 1;
  }
  let aDeck = f.attackDeck;
  for (let t in aDeck) {
    let tmp = aDeck[t];
    if (!char.includes(tmp)) {
      console.log(tmp);
      return false;
    }
    if (tmp != "Empty") {
      aDeckCount += 1;
    }
  }
  let dDeck = f.defenseDeck;
  for (let t in dDeck) {
    let tmp = dDeck[t];
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

function getDuo(d) {
  let size = 0;
  let deck = [];
  for (let tmp in d) {
    deck.push(primeChar[d[tmp]]);
    size += 1;
  }
  if (size < 2) {
    return [];
  }
  let du = comb.combination(deck, 2);
  let duo = [];
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

function getTrio(d) {
  let size = 0;
  let deck = [];
  for (let tmp in d) {
    deck.push(primeChar[d[tmp]]);
    size += 1;
  }
  if (size < 3) {
    return [];
  }
  let t = comb.combination(deck, 3);
  let trio = [];
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

function getItem(p) {
  let attd = {};
  let aDeck = p.attackDeck;
  for (let a in aDeck) {
    attd[a] = {S: aDeck[a]};
  }
  let defd = {};
  let dDeck = p.defenseDeck;
  for (let d in dDeck) {
    defd[d] = {S: dDeck[d]};
  }
  let atts = {};
  let aStar = p.attackStar;
  for (let a in aStar) {
    atts[a] = {N: aStar[a].toString()};
  }
  let defs = {};
  let dStar = p.defenseStar;
  for (let d in dStar) {
    defs[d] = {N: dStar[d].toString()};
  }
  let aDuo = [];
  for (let a in p.attackDuo) {
    aDuo.push({N: p.attackDuo[a].toString()});
  }
  let dDuo = [];
  for (let d in p.defenseDuo) {
    dDuo.push({N: p.defenseDuo[d].toString()});
  }
  let aTrio = [];
  for (let a in p.attackTrio) {
    aTrio.push({N: p.attackTrio[a].toString()});
  }
  let dTrio = [];
  for (let d in p.defenseTrio) {
    dTrio.push({N: p.defenseTrio[d].toString()});
  }
  let temp = {
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
    userIp: {S: p.userIp}
  };
  return temp;
}