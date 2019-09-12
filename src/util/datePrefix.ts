import moment = require('moment');

const datePrefix = function() {
  const m = moment().add(9, 'hour');

  const year = m.year();
  const month = m.month()+1;
  const day = m.date();

  const path = "year=" + year + "/month=" + month + "/day=" + day + "/";

  return path;
};

export default datePrefix;