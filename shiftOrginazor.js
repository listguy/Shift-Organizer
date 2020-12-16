"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entities_1 = require("./utils/Entities");
function orginizeShifts(students) {
    // returns 21 organized shifts (for week)
    if (students.length < 7)
        throw "at least 7 students are needed!";
    const shifts = initShifts();
    const availablePreferences = [];
    const unavailablePreferences = [];
    // will help to keep track of the students number of shifts
    // const numberOfShiftsOfStudent: { name: string; counter: number }[] = students.map(
    //   (student: IStudent) => {
    //     return { name: student.name, counter: 0 };
    //   }
    // );
    const numberOfShiftsOfStudent = students.reduce((prev, student) => {
        //TODO fix this
        //@ts-ignore
        prev[student.name] = 0;
        return prev;
    }, {});
    students.forEach((student) => student.preferences.forEach((preference) => {
        if (preference.available) {
            availablePreferences.push(preference);
        }
        else {
            unavailablePreferences.push(preference);
        }
    }));
    //first, assign all available preferences
    availablePreferences.forEach((pref) => {
        //TODO fix this
        //@ts-ignore
        const desiredShift = shifts[pref.shift.day][pref.shift.time];
        if (desiredShift.chosen)
            return;
        desiredShift.assignStudent(pref.student);
        pref.handled = true;
        //TODO fix this
        //@ts-ignore
        numberOfShiftsOfStudent[pref.student];
    });
    // assign all unavailable preferences
    unavailablePreferences.forEach((pref) => {
        //TODO fix this
        //@ts-ignore
        const undesiredShift = shifts[pref.shift.day][pref.shift.time];
        undesiredShift.addUnavailable(pref.student);
        pref.handled = true;
    });
    // assign all other students to shifts
    shifts.forEach((shiftsDay) => {
        Object.keys(shiftsDay).forEach((key) => {
            //TODO fix type
            //@ts-ignore
            const currentShift = shiftsDay[key];
            for (let student of students) {
                if (currentShift.chosen)
                    continue;
                if (currentShift.isStudentUnavailable(student))
                    continue;
                if (numberOfShiftsOfStudent[student.name] === 3)
                    continue;
                currentShift.assignStudent(student);
                numberOfShiftsOfStudent[student.name] += 1;
                break;
            }
            if (!currentShift.chosen)
                throw "a Shift with no student! stopping";
        });
    });
    return shifts;
}
function initShifts() {
    return [0, 1, 2, 3, 4, 5, 6].map((day) => {
        return {
            morning: new Entities_1.Shift(day, "morning"),
            noon: new Entities_1.Shift(day, "noon"),
            evening: new Entities_1.Shift(day, "evening"),
        };
    });
}
const names = [
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
const getRandomDay = () => Math.floor(Math.random() * 7);
const getShift = () => ["morning", "noon", "evening"][Math.floor(Math.random() * 3)];
const getAvailable = () => Boolean(Math.floor(Math.random() * 2));
const students = names.map((name) => {
    const newStudent = new Entities_1.Student(name);
    const pref = new Entities_1.Preference(newStudent, { day: getRandomDay(), time: getShift() }, getAvailable());
    newStudent.addPreference(pref);
    return newStudent;
});
console.log(orginizeShifts(students).forEach((day) => console.log(day)));
// students.forEach((student) => student.printPreferences());
