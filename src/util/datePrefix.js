var moment = require('moment');

var datePrefix = function() {
  let year = moment().year();
  let month = moment().month()+1;
  let day = moment().date();

  let path = "year=" + year + "/month=" + month + "/day=" + day + "/";

  return path;
};

module.exports = datePrefix;