import datePath from '../util/datePath';
import aws = require('aws-sdk');
import fileType = require('file-type');
import uuid = require('uuid/v4');
aws.config.update({region: 'ap-northeast-2'});
const s3 = new aws.S3();

const getFile = function(fileMime: any, buf: any): any {

  const fileExt = fileMime.ext;

  const filePath = datePath();
  const fileName = uuid() + "." + fileExt;
  const fileFullName = filePath + fileName;
  const fileFullPath = 'images/' + fileFullName;

  const params = {
    Bucket: "priconne-arenatime",
    Body: buf,
    Key: fileFullPath,
    ContentEncoding: 'base64',
  };

  return params;
};

/** 람다 핸들러 함수
 * @param event http request에 인자를 담아주세요
 * @return Promise 형태로 response를 반환합니다
 */
export const handler = async (event: any, context: any): Promise<any> => {

  //let buffer = new Buffer(new Buffer(event.body).toString('base64').replace(/^data:image\/\w+;base64,/, ""),'base64');
  const once = (event.body.match(/data:image\/\w+;base64,.+/)[0]).replace(/data:image\/\w+;base64,/, "");
  const twice = once.replace(/\n------WebKitFormBoundary.+/, "");
  const buffer = Buffer.from(twice, "base64");

  const fileMime = fileType(buffer);

  const params = getFile(fileMime, buffer);

  s3.putObject(params).promise()
    .then(() => {
      const response = {
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
      context.fail(response);
    });

}