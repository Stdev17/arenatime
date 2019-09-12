"use strict";
exports.__esModule = true;
var moment = require("moment");
var datePath = function () {
    var m = moment().add(9, 'hour');
    var year = m.year();
    var month = m.month() + 1;
    var day = m.date();
    var path = year + "/" + month + "/" + day + "/";
    return path;
};
exports["default"] = datePath;
