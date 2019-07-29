const aws = require('aws-sdk');
const dyn = new aws.DynamoDB();


module.exports.handler = async (event, context) => {


  let params = {
    TableName: 'match-table'
  };

  let get = await dyn.query(params).promise()
    .then(data => {
      result = {
        status: "OK"
      };
      return result;
    })
    .catch(err => {
      result = {
        status: "Failed"
      };
      return result;
    });

  if (get.status == "OK") {

  } else {

  }
}