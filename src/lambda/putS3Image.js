const datePath = require('../util/datePath');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const moment = require('moment');
const fileType = require('file-type');
const uuid = require('uuid/v4');

let getFile = function(fileMime, buf) {

  let fileExt = fileMime.ext;

  let filePath = datePath();
  let fileName = uuid() + "." + fileExt;
  let fileFullName = filePath + fileName;
  let fileFullPath = 'images/' + fileFullName;

  let params = {
    Bucket: "priconne-arenatime",
    Body: buf,
    Key: fileFullPath,
    ContentEncoding: 'base64',
  };

  return params;
};

module.exports.handler = (event, context) => {

  let response = {};

  //let buffer = new Buffer(new Buffer(event.body).toString('base64').replace(/^data:image\/\w+;base64,/, ""),'base64');
  let once = (event.body.match(/data:image\/\w+;base64,.+/)[0]).replace(/data:image\/\w+;base64,/, "");
  let twice = once.replace(/\n------WebKitFormBoundary.+/, "");
  let buffer = Buffer.from(twice, "base64");

  let fileMime = fileType(buffer);

  let params = getFile(fileMime, buffer);

  s3.putObject(params).promise()
    .then(data => {
      let response = {
        statusCode: 200,
        body: JSON.stringify({
          message: params.Key,
          runtime: context
        }),
        headers: {
          'Access-Control-Allow-Origin': 'https://stdev17.github.io',
          'Access-Control-Allow-Credentials': true,
        }
      };
      context.succeed(response);
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
      context.fail(response);
    });

}