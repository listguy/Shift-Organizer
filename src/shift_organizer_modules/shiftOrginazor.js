"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Entities_1 = require("./utils/Entities");
class ShiftManager {
    constructor() {
        this.students = [];
        this.shifts = [];
        this.initShifts();
    }
    addStudent(name) {
        const exist = this.students.findIndex((student) => student.name === name) !==
            -1;
        if (exist) {
            throw new Error("Student already exist");
        }
        const newStudent = new Entities_1.Student(name);
        this.students.push(newStudent);
        return newStudent;
    }
    removeStudent(name) {
        const indexOfStudent = this.students.findIndex((student) => student.name === name);
        if (indexOfStudent === -1) {
            throw new Error("Student does not exist");
        }
        this.students.splice(indexOfStudent, 1);
    }
    getStudent(name) {
        return this.students.find((student) => student.name === name);
    }
    addPreferenceToStudent(name, available, shift) {
        const student = this.students.find((student) => student.name === name);
        if (!student) {
            throw new Error("Student does not exist");
        }
        const newPref = new Entities_1.Preference(student, shift, available);
        student.addPreference(newPref);
    }
    removePreferenceFromStudent(name, shift) {
        const student = this.students.find((student) => student.name === name);
        if (!student) {
            throw new Error("Student does not exist");
        }
        try {
            student.removePreference(shift);
        }
        catch (e) {
            throw new Error(e);
        }
    }
    getShift(week, day, time) {
        // return this.shifts.find(
        //   (shift: IShift) => shift.day === day && shift.time === time
        // );
        return this.shifts[week - 1][day - 1].getShiftByTime(time);
    }
    assignStudentToShift(student, shift) {
        shift.assignStudent(student);
    }
    organize(students, weeks = 4) {
        // if (students.length < 7) throw new Error("at least 7 students are needed!");
        const shifts = this.cloneShifts();
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
            const { week, day, time, } = pref.shift;
            const desiredShift = shifts[week - 1][day - 1].getShiftByTime(time);
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
            const { week, day, time, } = pref.shift;
            const undesiredShift = shifts[week - 1][day - 1].getShiftByTime(time);
            undesiredShift.addUnavailable(pref.student);
            pref.handled = true;
        });
        // assign all other students to shifts
        //min conflicts
        console.log("the shifts!");
        console.log(this.shifts);
        return minConflicts(shifts, students, 200);
    }
    initShifts() {
        this.shifts = [0, 1, 2, 3].map((week) => [0, 1, 2, 3, 4, 5, 6].map((day) => {
            return day >= 5
                ? new Entities_1.OrginizedShiftDay(new Entities_1.Shift(day, week, "morning", true), new Entities_1.Shift(day, week, "noon", true), new Entities_1.Shift(day, week, "evening", true))
                : new Entities_1.OrginizedShiftDay(new Entities_1.Shift(day, week, "morning"), new Entities_1.Shift(day, week, "noon"), new Entities_1.Shift(day, week, "evening"));
        }));
    }
    cloneShifts() {
        // created a copy for min conflicts to work on and modify.
        return this.shifts.map((shiftsWeek) => shiftsWeek.map((shiftsDay) => new Entities_1.OrginizedShiftDay(undefined, undefined, undefined, ...shiftsDay
            .getAllShifts()
            .map((shift) => new Entities_1.Shift(shift.day, shift.week, shift.time, shift.isSpecial)))));
    }
    cloneStudents() {
        return this.students.map((student) => {
            const copyStudent = new Entities_1.Student(student.name);
            return copyStudent;
        });
    }
}
exports.default = ShiftManager;
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
function minConflicts(csp, students, maxSteps) {
    let current = csp;
    for (let i = 1; i < maxSteps; i++) {
        // debugger;
        console.log(i);
        if (shiftsAreOrganized(current))
            return current;
        let randomConflict = getRandomConflict(csp);
        let value = minimizeConflictsIn(randomConflict, students);
        if (randomConflict.chosen) {
            randomConflict.chosen.removeShift(randomConflict);
        }
        randomConflict.assignStudent(value);
        value.addShift(randomConflict);
    }
    return current;
}
function shiftsAreOrganized(currentState) {
    // checks if current shifts in state are fine organized:
    // * no students are assigned to shifts where they appear unavailable
    // * no student has more than 8 conflicts
    // * all shifts are assigned
    let legal = true;
    for (let shiftWeek of currentState) {
        for (let shiftDay of shiftWeek) {
            for (let curShift of shiftDay.getAllShifts()) {
                if (!curShift.chosen) {
                    legal = false;
                    break;
                }
                if (curShift.unavailable.includes(curShift.chosen)) {
                    legal = false;
                    break;
                }
                if (getConflicts(curShift.chosen, curShift) >= 5) {
                    legal = false;
                    break;
                }
            }
        }
    }
    return legal;
}
function getRandomConflict(csp) {
    // get a random unassigned shift
    let availableShifts = lodash_1.flatMapDepth(csp, (shiftWeek) => shiftWeek.map((shiftDay) => shiftDay.getAllShifts()), 2).filter((shift) => !shift.chosen);
    if (!availableShifts.length) {
        availableShifts = lodash_1.flatMapDepth(csp, (shiftWeek) => shiftWeek.map((shiftDay) => shiftDay.getAllShifts()), 2).filter((shift) => getConflicts(shift.chosen, shift) >= 4.5);
        console.log("happend");
    }
    console.log(availableShifts.length);
    return availableShifts[Math.floor(Math.random() * availableShifts.length)];
}
function minimizeConflictsIn(conflictedShift, students) {
    // assign a student that will minimize the conflicts
    const conflictsOfStudents = students.map((student) => {
        return { conflicts: getConflicts(student, conflictedShift), student };
    });
    const leastConflictedStudent = conflictsOfStudents.sort((a, b) => a.conflicts - b.conflicts)[0];
    console.log(leastConflictedStudent);
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
    for (let assignedShift of student.shifts) {
        if (assignedShift === shift)
            continue;
        if (assignedShift.isAdjacent(shift))
            conflictPts += 15;
    }
    if (shift.isSpecial) {
        conflictPts += student.shifts.reduce((sum, studentShift) => studentShift.isSpecial ? sum + 10 : sum, 0);
    }
    return conflictPts;
}
// function initShifts(): IOrganizedShiftDay[] {
//   class OrginizedShiftDay implements IOrganizedShiftDay {
//     private morning: IShift;
//     private noon: IShift;
//     private evening: IShift;
//     constructor(morning: IShift, noon: IShift, evening: IShift) {
//       this.morning = morning;
//       this.noon = noon;
//       this.evening = evening;
//     }
//     getMorning(): IShift {
//       return this.morning;
//     }
//     getNoon(): IShift {
//       return this.noon;
//     }
//     getEvening(): IShift {
//       return this.evening;
//     }
//     getAllShifts(): IShift[] {
//       return [this.morning, this.noon, this.evening];
//     }
//   }
//   // return [0, 1, 2, 3, 4, 5, 6].map((day: number) => {
//   // return {
//   // getMorning: () => new Shift(day, "morning"),
//   //
//   // morning: new Shift(day, "morning"),
//   // noon: new Shift(day, "noon"),
//   // evening: new Shift(day, "evening"),
//   // getShiftIterator: () => [],
//   // };
//   // });
//   // }
//   return [0, 1, 2, 3, 4, 5, 6].map((day: number) => {
//     return new OrginizedShiftDay(
//       new Shift(day, "morning"),
//       new Shift(day, "noon"),
//       new Shift(day, "evening")
//     );
//   });
// }
// const names: string[] = [
//   "Nitzan",
//   "Nadav",
//   "Asaf",
//   "Shimon",
//   "Anna",
//   "Idan",
//   "Danel",
//   "Lahav",
//   "Sean",
//   "Omri",
// ];
// const getRandomDay: () => number = () => Math.floor(Math.random() * 7);
// const getShift: () => string = () =>
//   ["morning", "noon", "evening"][Math.floor(Math.random() * 3)];
// const getAvailable: () => boolean = () =>
//   Boolean(Math.floor(Math.random() * 2));
// const students: IStudent[] = names.map((name: string) => {
//   const newStudent: IStudent = new Student(name);
//   const pref: IPreference = new Preference(
//     newStudent,
//     { day: getRandomDay(), time: getShift() },
//     getAvailable()
//   );
//   newStudent.addPreference(pref);
//   return newStudent;
// });
// const sm = new ShiftManager();
// console.log(sm.organize(students, 3).forEach((day) => console.log(day)));
// students.forEach((student) => student.printPreferences());
