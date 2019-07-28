const datePath = require('../util/datePath');
const char = require('../util/char');
const primeChar = require('../util/prime.ts');

const aws = require('aws-sdk');
const s3 = new aws.S3();
const dyn = new aws.DynamoDB();
const moment = require('moment');
const uuid = require('uuid/v4');
const comb = require('js-combinatorics');
const zlib = require('zlib');

let parseData = function(req) {
  if (!validateProperties(req)) {
    return {};
  }
  if (!validateStarAndDeck(req)) {
    return {};
  }
  console.log("second");

  req.matchId = uuid();
  req.date = moment().format("YYYY-MM-DD HH:mm:ss");
  let attackId = 1;
  let defenseId = 1;
  for (let tmp in req.attackDeck) {
    attackId *= primeChar[tmp];
  }
  for (let tmp in req.defenseDeck) {
    defenseId *= primeChar[tmp];
  }
  req.attackId = attackId;
  req.defenseId = defenseId;

  req.attackDuo = getDuo(req.attackDeck);
  req.attackTrio = getTrio(req.attackDeck);
  req.defenseDuo = getDuo(req.defenseDeck);
  req.defenseTrio = getTrio(req.defenseDeck);

  req.netUpvotes = 0;
  req.upvotes = 0;
  req.downvotes = 0;

  return req;
}

module.exports.handler = (event, context) => {
  let response = {};
  let skip = false;
  console.log("first");
  let request = JSON.parse(event.body);
  let parsed = parseData(request);
  if (parsed === {}) {
    return 'Parse Failed', false;
  }
  parsed.userIp = event.sourceIP;

  //
  console.log("third");
  let dataParams = {
    TableName: "match-table",
    Item: parsed
  };
  dyn.putItem(dataParams).promise()
    .then(data => {
      //
    })
    .catch(err => {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: err,
          runtime: context
        })
      };
      skip = true;
    });

  if (skip) {
    context.fail(response);
  }
  console.log("fourth");

  let vote = {
    matchId: parsed.matchId,
    voters: []
  };
  let voteParams = {
    TableName: "voter-table",
    Item: vote
  };
  dyn.putItem(voteParams).promise()
    .then(data => {
      //
    })
    .catch(err => {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: err,
          runtime: context
        })
      };
      skip = true;
    });

  if (skip) {
    context.fail(response);
  }

  response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Upload Succeeded",
      runtime: context
    })
  };

  context.succeed(response);

  /*
  let str = JSON.stringify(parsed);
  let gzip = zlib.createGzip();

  let filePath = 'data/' + datePath();
  let fileName = unixTime(now) + ".gz";
  let fileFullName = filePath + fileName;
  let fileFullPath = 'priconne-arenatime/' + fileFullName;

  let params = {
    Bucket: 'priconne-arenatime',
    //Body: 
  };

  s3.putObject(params, function(err, data) {
    if (err) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: err,
          runtime: context,
          input: event
        })
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Succeeded Data Upload',
          runtime: context,
          input: event
        })
      };
    }
  });
  */
}

function validateProperties(f) {
  //Power
  if (!(f.attackPower > 100)) {
    return false;
  }
  if (!(f.attackPower < 70000)) {
    return false;
  }
  if (!(f.defensePower > 100)) {
    return false;
  }
  if (!(f.defensePower < 70000)) {
    return false;
  }
  //Arena
  if (f.arena != "battleArena" || f.arena != "princessArena") {
    return false;
  }
  //Result
  if (f.result != "attackWin" || f.result != "defenseWin") {
    return false;
  }
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
    if (tmp > 5 || tmp < 1) {
      return false;
    }
    aStarCount += 1;
  }
  let d = f.defenseStar;
  for (let tmp in d) {
    if (tmp > 5 || tmp < 1) {
      return false;
    }
    dStarCount += 1;
  }
  let aDeck = f.attackDeck;
  for (let tmp in aDeck) {
    if (!char.includes(tmp)) {
      return false;
    }
    aDeckCount += 1;
  }
  let dDeck = f.defenseDeck;
  for (let tmp in dDeck) {
    if (!char.includes(tmp)) {
      return false;
    }
    dDeckCount += 1;
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
    deck.push(tmp);
    size += 1;
  }
  if (size < 2) {
    return [];
  }
  let duo = comb.combination(deck, 2);
  return duo;
}

function getTrio(d) {
  let size = 0;
  let deck = [];
  for (let tmp in d) {
    deck.push(tmp);
    size += 1;
  }
  if (size < 3) {
    return [];
  }
  let trio = comb.combination(deck, 3);
  return trio;
}