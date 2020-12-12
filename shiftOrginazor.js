"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Entities_1 = require("./utils/Entities");
function orginizeShift(students) {
    // returns 21 organized shifts (for week)
    if (students.length < 7)
        throw "at least 7 students are needed!";
    var shifts = [];
    var availablePreferences = [];
    var unavailablePreferences = [];
    students.forEach(function (student) {
        return student.preferences.forEach(function (preference) {
            if (preference.available) {
                availablePreferences.push(preference);
            }
            else {
                unavailablePreferences.push(preference);
            }
        });
    });
    //first, assign all available preferences
    return shifts;
}
function initShifts() {
    return [1, 2, 3, 4, 5, 6, 7].map(function (day) {
        return {
            morning: new Entities_1.Shift(day, "morning"),
            noon: new Entities_1.Shift(day, "noon"),
            evening: new Entities_1.Shift(day, "evening"),
        };
    });
}
