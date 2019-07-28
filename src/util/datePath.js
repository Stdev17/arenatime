var moment = require('moment');

var datePath = function() {
  let year = moment().year();
  let month = moment().month()+1;
  let day = moment().date();

  let path = year + "/" + month + "/" + day + "/";

  return path;
};

module.exports = datePath;