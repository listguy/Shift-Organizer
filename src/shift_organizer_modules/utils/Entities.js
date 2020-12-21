"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Shift {
    constructor(day, time) {
        this.unavailable = [];
        this.day = day;
        this.time = time;
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
        this.preferences.push(preference);
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
// let s1 = new Shift(1, "a");
// let s2 = new Shift(2, "b");
// s1.addUnavailable(new Student("bob"));
// s2.addUnavailable(new Student("mo"));
// console.log(s1.unavailable);
// console.log(s2.unavailable);
