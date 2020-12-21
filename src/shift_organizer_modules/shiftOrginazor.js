"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
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
        // @ts-ignore
        const desiredShift = shifts[pref.shift.day][pref.shift.time];
        if (desiredShift.chosen)
            return;
        desiredShift.assignStudent(pref.student);
        pref.handled = true;
        //TODO fix this
        //@ts-ignore
        numberOfShiftsOfStudent[pref.student] += 1;
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
    // old 'dumb' fnnction
    // shifts.forEach((shiftsDay: IOrganizedShiftDay) => {
    //   Object.keys(shiftsDay).forEach((key: string) => {
    //     //TODO fix type
    //     //@ts-ignore
    //     const currentShift = shiftsDay[key];
    //     for (let student of students) {
    //       if (currentShift.chosen) continue;
    //       if (currentShift.isStudentUnavailable(student)) continue;
    //       if (numberOfShiftsOfStudent[student.name] === 3) continue;
    //       currentShift.assignStudent(student);
    //       numberOfShiftsOfStudent[student.name] += 1;
    //       break;
    //     }
    //     if (!currentShift.chosen) throw "a Shift with no student! stopping";
    //   });
    // });
    //min conflicts
    return minConflicts(shifts, 35);
}
exports.default = orginizeShifts;
//Min conflicts Algo pseudo code
/*function MinConflicts(csp:any, max_steps:number) {
  //csp:
  //max_steps: number of steps before giving up

  current = initial assigment for csp
  for i=1 to max_steps do
    if current is a solution for csp
      return current
    const randomVar = randomly chosen conflicted variable in csp
    const value = the value for randomVar that minimizes conflicts
    set var = value in current
  

  return failure
} */
function minConflicts(csp, maxSteps) {
    let current = csp;
    for (let i = 1; i < maxSteps; i++) {
        console.log(i);
        if (shiftsAreOrganized(current))
            return current;
        let VAR = getRandomConflict(csp);
        let value = minimizeConflictsIn(VAR);
        VAR.assignStudent(value);
        value.addShift(VAR);
    }
    return current;
}
function shiftsAreOrganized(currentState) {
    // checks if current shifts in state are fine organized:
    // * no students are assigned to shifts where they appear unavailable
    // * no student has two straight shifts - MISSING
    // * all shifts are assigned
    let legal = true;
    // currentState.forEach((shiftDay: IOrganizedShiftDay) => {
    for (let shiftDay in currentState) {
        // Object.keys(shiftDay).forEach((key: string) => {
        for (let key in Object.keys(shiftDay)) {
            // @ts-ignore
            let curShift = shiftDay[key];
            if (!curShift.chosen) {
                legal = false;
                break;
            }
            if (curShift.unavailable.includes(curShift.chosen)) {
                legal = false;
                break;
            }
        }
        // });
    }
    // });
    return legal;
}
function getRandomConflict(csp) {
    // get a random unassigned shift
    let availableShifts = lodash_1.flatMap(csp, (shiftDay) => [
        shiftDay.morning,
        shiftDay.noon,
        shiftDay.evening,
    ]).filter((shift) => !shift.chosen);
    if (!availableShifts.length) {
        availableShifts = lodash_1.flatMap(csp, (shiftDay) => [
            shiftDay.morning,
            shiftDay.noon,
            shiftDay.evening,
        ]).filter((shift) => getConflicts(shift.chosen, shift) >= 3);
        console.log("happend");
    }
    console.log(availableShifts.length);
    return availableShifts[Math.floor(Math.random() * availableShifts.length)];
}
function minimizeConflictsIn(conflictedShift) {
    // assign a student that will minimize the conflicts
    const conflictsOfStudents = students.map((student) => {
        return { conflicts: getConflicts(student, conflictedShift), student };
    });
    const leastConflictedStudent = conflictsOfStudents.sort((a, b) => a.conflicts - b.conflicts)[0];
    return leastConflictedStudent.student;
}
function getConflicts(student, shift) {
    // 3 pts if unavailable for this shift
    // a point for each shift he has
    // 2 points for each shift in a row
    let conflictPts = 0;
    if (shift.unavailable.includes(student))
        conflictPts += 3;
    conflictPts += student.shifts.length;
    conflictPts += student.shifts.reduce((sum, cShift) => (shift.day === cShift.day ? sum * 2 : sum), 1);
    return conflictPts;
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
students.forEach((student) => student.printPreferences());
