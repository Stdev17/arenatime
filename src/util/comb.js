let co = require('js-combinatorics');

function comb (deck, num) {
  return co.combination(deck, num);
}

export default comb;