"use strict";
exports.__esModule = true;
var moment = require("moment");
var datePrefix = function () {
    var m = moment().add(9, 'hour');
    var year = m.year();
    var month = m.month() + 1;
    var day = m.date();
    var path = "year=" + year + "/month=" + month + "/day=" + day + "/";
    return path;
};
exports["default"] = datePrefix;
