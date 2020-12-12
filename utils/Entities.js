"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shift = /** @class */ (function () {
    function Shift(day, time) {
        this.unavailable = [];
        this.day = day;
        this.time = time;
    }
    Shift.prototype.addUnavailable = function (student) {
        this.unavailable.push(student);
    };
    return Shift;
}());
