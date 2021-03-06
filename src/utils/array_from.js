
// When using firefox, we cannot use Array.from since it apparently does not
// support custom iterables
// XXX: always use forEach until we get to the bottom of firefox issues
var USE_NATIVE = false; // typeof Set.prototype[Symbol.iterator] !== 'undefined';

export default function from_array(iterable) {
  
  if(USE_NATIVE || Array.isArray(iterable)) {
    return Array.from.apply(this, arguments);
  }
  
  var res = [];
  iterable.forEach(function(value) {
    res.push(value);
  });
  return res;
  
}
