var moment = require('moment');

var dateNow = moment();
var d = moment('2014-11-11');
diff = dateNow.diff(d, 'years');
diff2 = dateNow.diff(d, 'months');

console.log(diff)
console.log(diff2)

