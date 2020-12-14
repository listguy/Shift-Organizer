"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shift = /** @class */ (function () {
    function Shift(day, time) {
        this.unavailable = [];
        this.day = day;
        this.time = time;
    }
    Shift.prototype.assignStudent = function (student) {
        this.chosen = student;
    };
    Shift.prototype.addUnavailable = function (student) {
        this.unavailable.push(student);
    };
    Shift.prototype.printUnavailable = function () {
        var formated = this.unavailable.map(function (student) { return student.name; });
        console.log(formated);
    };
    return Shift;
}());
exports.Shift = Shift;
var Student = /** @class */ (function () {
    function Student(name) {
        this.shifts = [];
        this.preferences = [];
        this.name = name;
    }
    Student.prototype.addShift = function (shift) {
        this.shifts.push(shift);
    };
    Student.prototype.printShifts = function () {
        var formated = this.shifts.map(function (shift) {
            return { day: shift.day, time: shift.time };
        });
        console.log(formated);
    };
    Student.prototype.addPreference = function (preference) {
        this.preferences.push(preference);
    };
    Student.prototype.printPreferences = function () {
        this.preferences.map(function (preference) { return console.log(preference); });
    };
    return Student;
}());
exports.Student = Student;
var Preference = /** @class */ (function () {
    function Preference(student, shift, available) {
        this.student = student;
        this.shift = shift;
        this.available = available;
        this.handled = false;
    }
    return Preference;
}());
exports.Preference = Preference;
// let s1 = new Shift(1, "a");
// let s2 = new Shift(2, "b");
// s1.addUnavailable(new Student("bob"));
// s2.addUnavailable(new Student("mo"));
// console.log(s1.unavailable);
// console.log(s2.unavailable);
