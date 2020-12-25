"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
class Shift {
    constructor(day, week, time, special = false) {
        this.unavailable = [];
        this.day = day;
        this.week = week;
        this.time = time;
        this.isSpecial = special;
        this.timeStamp =
            week * interface_1.weekInMs +
                day * interface_1.dayInMS +
                interface_1.shiftInMS * (time === "morning" ? 0 : time === "noon" ? 1 : 2);
    }
    assignStudent(student) {
        this.chosen = student;
    }
    addUnavailable(student) {
        this.unavailable.push(student);
    }
    isStudentUnavailable(student) {
        return this.unavailable.includes(student);
    }
    printUnavailable() {
        const formated = this.unavailable.map((student) => student.name);
        console.log(formated);
    }
    isAdjacent(otherShift) {
        return (otherShift.timeStamp === this.timeStamp - interface_1.shiftInMS ||
            otherShift.timeStamp === this.timeStamp + interface_1.shiftInMS);
    }
}
exports.Shift = Shift;
class Student {
    constructor(name) {
        this.shifts = [];
        this.preferences = [];
        this.name = name;
    }
    addShift(shift) {
        this.shifts.push(shift);
    }
    removeShift(shift) {
        this.shifts = this.shifts.filter((s) => s != shift);
    }
    printShifts() {
        const formated = this.shifts.map((shift) => {
            return { day: shift.day, time: shift.time };
        });
        console.log(formated);
    }
    addPreference(preference) {
        if (preference instanceof Preference === false)
            throw new Error(`Expected an object of type Preferene but got ${typeof preference} instead`);
        this.preferences.push(preference);
    }
    removePreference(shift) {
        const prefIndex = this.preferences.findIndex((pref) => pref.shift === shift);
        if (!prefIndex) {
            throw "Student doe sno have a preference for this shift";
        }
        this.preferences.splice(prefIndex, 1);
    }
    printPreferences() {
        this.preferences.map((preference) => console.log(preference));
    }
}
exports.Student = Student;
class Preference {
    constructor(student, shift, available) {
        this.student = student;
        this.shift = shift;
        this.available = available;
        this.handled = false;
    }
}
exports.Preference = Preference;
class OrginizedShiftDay {
    constructor(morning, noon, evening, ...arr) {
        this.morning = morning || arr[0];
        this.noon = noon || arr[1];
        this.evening = evening || arr[2];
    }
    getMorning() {
        return this.morning;
    }
    getNoon() {
        return this.noon;
    }
    getEvening() {
        return this.evening;
    }
    getAllShifts() {
        return [this.morning, this.noon, this.evening];
    }
    getShiftByTime(time) {
        switch (time) {
            case "morning":
                return this.morning;
            case "noon":
                return this.noon;
            case "evening":
                return this.evening;
        }
        console.log("Time is ilegal. Should be one of morning, noon, evening");
    }
}
exports.OrginizedShiftDay = OrginizedShiftDay;
// let s1 = new Shift(1, "a");
// let s2 = new Shift(2, "b");
// s1.addUnavailable(new Student("bob"));
// s2.addUnavailable(new Student("mo"));
// console.log(s1.unavailable);
// console.log(s2.unavailable);
