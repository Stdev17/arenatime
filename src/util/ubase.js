let ub = require('uuid-base64');

function ubase(str) {
  return ub.encode(str);
}

export default ubase;