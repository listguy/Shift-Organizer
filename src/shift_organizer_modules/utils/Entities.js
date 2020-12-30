"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
const daysInWeek = [
    "Sunday",
    "Monday",
    "Tuseday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
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
        this.chosen.handlePrefOfShift(this, "assign");
        student.addShift(this);
    }
    unassignStudent() {
        this.chosen?.removeShift(this);
        this.chosen?.handlePrefOfShift(this, "unassign");
        this.chosen = undefined;
    }
    addUnavailable(student) {
        this.unavailable.push(student);
    }
    removeUnavailable(student) {
        const toRemoveIndex = this.unavailable.findIndex((s) => s === student);
        if (toRemoveIndex === -1)
            return;
        this.unavailable.splice(toRemoveIndex, 1);
    }
    isStudentUnavailable(student) {
        return this.unavailable.includes(student);
    }
    printUnavailable() {
        const formated = this.unavailable.map((student) => student.name);
        console.log(formated);
    }
    isAdjacent(otherShift) {
        if (otherShift instanceof Shift === false)
            return false;
        return (otherShift.timeStamp === this.timeStamp - interface_1.shiftInMS ||
            otherShift.timeStamp === this.timeStamp + interface_1.shiftInMS);
    }
    hasSameStudent(otherShift) {
        if (otherShift instanceof Shift === false)
            return false;
        return otherShift.chosen === this.chosen;
    }
    prettyPrintTime() {
        return `${daysInWeek[this.day]}, ${this.time} week ${this.week + 1}`;
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
    hasPreference(prefStamp, available) {
        return this.getPreference(prefStamp, available) !== undefined;
    }
    addPreference(preference) {
        if (preference instanceof Preference === false)
            throw new Error(`Expected an object of type Preferene but got ${typeof preference} instead`);
        if (this.preferences.find((pref) => pref.shiftTimeStamp === preference.shiftTimeStamp)) {
            throw new Error(`A Preference in this time already exists for this student`);
        }
        this.preferences.push(preference);
        return true;
    }
    removePreference(shiftToRemoveTimestamp) {
        const prefIndex = this.preferences.findIndex((pref) => pref.shiftTimeStamp === shiftToRemoveTimestamp);
        if (prefIndex === -1) {
            throw new Error("Student does not have a preference for this shift");
        }
        console.log("here");
        this.preferences.splice(prefIndex, 1);
    }
    getPreference(stamp, available) {
        return this.preferences.find((pref) => pref.shiftTimeStamp === stamp && pref.available === available);
    }
    getPreferences() {
        return this.preferences.slice();
    }
    handlePrefOfShift(shift, toggle) {
        const availablePref = this.getPreference(shift.timeStamp, true);
        const unavailablePref = this.getPreference(shift.timeStamp, false);
        if (!availablePref && !unavailablePref)
            return;
        switch (toggle) {
            case "assign":
                if (availablePref)
                    availablePref.handled = true;
                else
                    unavailablePref.handled = false;
                break;
            case "unassign":
                if (availablePref)
                    availablePref.handled = false;
                else
                    unavailablePref.handled = true;
                break;
        }
    }
    printPreferences() {
        this.preferences.map((preference) => console.log(preference));
    }
}
exports.Student = Student;
class Preference {
    constructor(student, shiftTimeStamp, available) {
        this.student = student;
        this.shiftTimeStamp = shiftTimeStamp;
        this.available = available;
        this.handled = false;
    }
    getTimeObject() {
        const week = Math.floor(this.shiftTimeStamp / interface_1.weekInMs);
        const day = Math.floor((this.shiftTimeStamp - interface_1.weekInMs * week) / interface_1.dayInMS);
        const shiftIndex = Math.floor((this.shiftTimeStamp - week * interface_1.weekInMs - day * interface_1.dayInMS) / interface_1.shiftInMS);
        const time = shiftIndex === 0 ? "morning" : shiftIndex === 1 ? "noon" : "evening";
        return { week, day, time };
    }
    getTimeString() {
        const { week, day, time } = this.getTimeObject();
        return `${daysInWeek[day]}, ${time}, week ${week + 1}`;
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
