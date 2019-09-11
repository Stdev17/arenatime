import moment from 'moment';

const datePath = function() {
  const m = moment().add(9, 'hour');

  const year = m.year();
  const month = m.month()+1;
  const day = m.date();

  let path = year + "/" + month + "/" + day + "/";

  return path;
};

export default datePath;