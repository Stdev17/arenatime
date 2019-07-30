const aws = require('aws-sdk');
const s3 = new aws.S3();

module.exports.handler = async (event, context) => {

  let req = event.queryStringParameters[0];

  let params = {
    Bucket: 'priconne-arenatime',
    Key: req
  };

  let get = await s3.getObject(params).promise()
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
          message: 'Getting Item Failed',
          runtime: err
        })
      };
      return result;
    });

    return get;
}