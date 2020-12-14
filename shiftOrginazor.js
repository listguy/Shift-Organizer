"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Entities_1 = require("./utils/Entities");
function orginizeShifts(students) {
    // returns 21 organized shifts (for week)
    if (students.length < 7)
        throw "at least 7 students are needed!";
    var shifts = initShifts();
    var availablePreferences = [];
    var unavailablePreferences = [];
    // will help to keep track of the students number of shifts
    // const numberOfShiftsOfStudent: { name: string; counter: number }[] = students.map(
    //   (student: IStudent) => {
    //     return { name: student.name, counter: 0 };
    //   }
    // );
    var numberOfShiftsOfStudent = students.reduce(function (prev, student) {
        //TODO fix this
        //@ts-ignore
        prev[student.name] = 0;
        return prev;
    }, {});
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
    availablePreferences.forEach(function (pref) {
        //TODO fix this
        //@ts-ignore
        var desiredShift = shifts[pref.shift.day][pref.shift.time];
        if (desiredShift.chosen)
            return;
        desiredShift.assignStudent(pref.student);
        pref.handled = true;
        //TODO fix this
        //@ts-ignore
        numberOfShiftsOfStudent[pref.student];
    });
    // assign all unavailable preferences
    unavailablePreferences.forEach(function (pref) {
        //TODO fix this
        //@ts-ignore
        var undesiredShift = shifts[pref.shift.day][pref.shift.time];
        undesiredShift.addUnavailable(pref.student);
        pref.handled = true;
    });
    return shifts;
}
function initShifts() {
    return [0, 1, 2, 3, 4, 5, 6].map(function (day) {
        return {
            morning: new Entities_1.Shift(day, "morning"),
            noon: new Entities_1.Shift(day, "noon"),
            evening: new Entities_1.Shift(day, "evening"),
        };
    });
}
var names = [
    "Nitzan",
    "Nadav",
    "Asaf",
    "Shimon",
    "Anna",
    "Idan",
    "Danel",
    "Lahav",
    "Sean",
    "Omri",
];
var getRandomDay = function () { return Math.floor(Math.random() * 7); };
var getShift = function () {
    return ["morning", "noon", "evening"][Math.floor(Math.random() * 3)];
};
var getAvailable = function () {
    return Boolean(Math.floor(Math.random() * 2));
};
var students = names.map(function (name) {
    var newStudent = new Entities_1.Student(name);
    var pref = new Entities_1.Preference(newStudent, { day: getRandomDay(), time: getShift() }, getAvailable());
    newStudent.addPreference(pref);
    return newStudent;
});
console.log(orginizeShifts(students).forEach(function (day) { return console.log(day); }));
students.forEach(function (student) { return student.printPreferences(); });
