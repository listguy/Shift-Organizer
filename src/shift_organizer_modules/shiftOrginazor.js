"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./utils/interface");
const lodash_1 = require("lodash");
const Entities_1 = require("./utils/Entities");
class ShiftManager {
    constructor() {
        this.students = [];
        this.shifts = [];
        this.initShifts();
        this.HeuristicTreshold = 0;
    }
    addStudent(name) {
        const exist = this.students.findIndex((student) => student.name === name) !==
            -1;
        if (exist) {
            throw new Error("Student already exist");
        }
        const newStudent = new Entities_1.Student(name);
        this.students.push(newStudent);
        this.HeuristicTreshold = calculateTreshold(this.students.length, this.shifts.length * 7);
        return newStudent;
    }
    removeStudent(name) {
        const indexOfStudent = this.students.findIndex((student) => student.name === name);
        if (indexOfStudent === -1) {
            throw new Error("Student does not exist");
        }
        this.students.splice(indexOfStudent, 1);
        this.HeuristicTreshold = calculateTreshold(this.students.length, this.shifts.length * 7);
    }
    getStudent(name) {
        return this.students.find((student) => student.name === name);
    }
    getAllStudents() {
        return this.students.slice();
    }
    addPreferenceToStudent(name, available, shiftTimestamp) {
        const student = this.students.find((student) => student.name === name);
        if (!student) {
            throw new Error("Student does not exist");
        }
        if (shiftTimestamp < 0 ||
            shiftTimestamp > 4 * interface_1.weekInMs ||
            shiftTimestamp % interface_1.shiftInMS !== 0) {
            throw new Error(`Timestamp is ilegal. Check it is positive, not larger than ${4 * interface_1.weekInMs} and points to the begining of the shift`);
        }
        const newPref = new Entities_1.Preference(student, shiftTimestamp, available);
        try {
            student.addPreference(newPref);
            return true;
        }
        catch (e) {
            throw e;
        }
    }
    removePreferenceFromStudent(name, shiftToRemoveTimestamp) {
        const student = this.students.find((student) => student.name === name);
        if (!student) {
            throw new Error("Student does not exist");
        }
        if (shiftToRemoveTimestamp < 0 ||
            shiftToRemoveTimestamp > 4 * interface_1.weekInMs ||
            shiftToRemoveTimestamp % interface_1.shiftInMS !== 0) {
            throw new Error(`Timestamp is ilegal. Check it is positive, not larger than ${4 * interface_1.weekInMs} and points to the begining of the shift`);
        }
        try {
            student.removePreference(shiftToRemoveTimestamp);
            return true;
        }
        catch (e) {
            throw e;
        }
    }
    getShift(week, day, time) {
        // return this.shifts.find(
        //   (shift: IShift) => shift.day === day && shift.time === time
        // );
        if (!this.shifts[week - 1])
            return undefined;
        return this.shifts[week - 1][day - 1]?.getShiftByTime(time);
    }
    getShiftByStamp(stamp) {
        const week = Math.floor(stamp / interface_1.weekInMs);
        const day = Math.floor((stamp - interface_1.weekInMs * week) / interface_1.dayInMS);
        const shiftIndex = Math.floor((stamp - week * interface_1.weekInMs - day * interface_1.dayInMS) / interface_1.shiftInMS);
        const time = shiftIndex === 0 ? "morning" : shiftIndex === 1 ? "noon" : "evening";
        return this.getShift(week + 1, day + 1, time);
    }
    getAllShifts() {
        return this.shifts.slice();
    }
    assignStudentToShift(student, shift) {
        shift.assignStudent(student);
    }
    organize() {
        const shifts = this.shifts;
        const students = this.students;
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
            const { week, day, time, } = pref.getPrettyTime();
            const desiredShift = shifts[week][day].getShiftByTime(time);
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
            const { week, day, time, } = pref.getPrettyTime();
            const undesiredShift = shifts[week][day].getShiftByTime(time);
            undesiredShift.addUnavailable(pref.student);
            pref.handled = true;
        });
        // assign all other students to shifts
        const organizedShifts = minConflicts(shifts, students, 1000, this.HeuristicTreshold, this);
        this.shifts = organizedShifts;
        console.log(this.HeuristicTreshold);
        return organizedShifts;
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
function minConflicts(csp, students, maxSteps, treshold, SM) {
    let current = csp;
    for (let i = 1; i < maxSteps; i++) {
        console.log(i);
        if (shiftsAreOrganized(current, treshold, SM))
            return current;
        let randomConflict = getRandomConflict(csp, treshold);
        let value = minimizeConflictsIn(randomConflict, students);
        if (randomConflict.chosen) {
            randomConflict.chosen.removeShift(randomConflict);
        }
        randomConflict.assignStudent(value);
        value.addShift(randomConflict);
    }
    return current;
}
function shiftsAreOrganized(currentState, treshold, SM) {
    // checks if current shifts in state are fine organized:
    let legal = true;
    for (let shiftWeek of currentState) {
        for (let shiftDay of shiftWeek) {
            for (let curShift of shiftDay.getAllShifts()) {
                if (!curShift.chosen) {
                    legal = false;
                    break;
                }
                const nextShift = SM.getShiftByStamp(curShift.timeStamp + interface_1.shiftInMS);
                const prevShift = SM.getShiftByStamp(curShift.timeStamp - interface_1.shiftInMS);
                if (curShift.hasSameStudent(nextShift) ||
                    curShift.hasSameStudent(prevShift)) {
                    legal = false;
                    break;
                }
            }
        }
    }
    return legal;
}
function getRandomConflict(csp, treshold) {
    // get a random unassigned shift
    let availableShifts = lodash_1.flatMapDepth(csp, (shiftWeek) => shiftWeek.map((shiftDay) => shiftDay.getAllShifts()), 2).filter((shift) => !shift.chosen);
    if (!availableShifts.length) {
        availableShifts = lodash_1.flatMapDepth(csp, (shiftWeek) => shiftWeek.map((shiftDay) => shiftDay.getAllShifts()), 2).filter((shift, index, shiftsArr) => shift.hasSameStudent(shiftsArr[index + 1]) ||
            shift.hasSameStudent(shiftsArr[index - 1]));
    }
    if (availableShifts.length === 0) {
        console.log("Should have quit!");
    }
    return availableShifts[Math.floor(Math.random() * availableShifts.length)];
}
function minimizeConflictsIn(conflictedShift, students) {
    // assign a student that will minimize the conflicts
    const conflictsOfStudents = students.map((student) => {
        return { conflicts: getConflictsWith(student, conflictedShift), student };
    });
    const leastConflictedStudent = conflictsOfStudents.sort((a, b) => a.conflicts - b.conflicts)[0];
    console.log(leastConflictedStudent);
    return leastConflictedStudent.student;
}
function getConflictsWith(student, shift) {
    if (!shift) {
        console.log("Whatttttttttttttttttttttttttt");
        return 100;
    }
    // sum of shift count between the student's shifts
    if (student.shifts.length <= 1) {
        return shift.isAdjacent(student.shifts[0]) ? 1 : 0;
    }
    const distanceBetweenShifts = student.shifts
        .map((shift) => shift.timeStamp)
        .concat(shift.timeStamp)
        .sort((a, b) => a - b)
        .reduce((sum, curShiftTime, index, shiftsArr) => {
        // console.log(shiftsArr);
        if (index === shiftsArr.length - 1)
            return sum;
        return sum + (shiftsArr[index + 1] - curShiftTime) / interface_1.shiftInMS;
    }, 0);
    return 1 / (distanceBetweenShifts / student.shifts.length);
}
function evaluateCurrentShiftsOf(student) {
    if (student.shifts.length <= 1)
        return 1;
    return (1 /
        student.shifts
            .map((shift) => shift.timeStamp)
            .sort((a, b) => a - b)
            .reduce((sum, curShiftTime, index, shiftsArr) => {
            // console.log(shiftsArr);
            if (index === shiftsArr.length - 1)
                return sum;
            return sum + (shiftsArr[index + 1] - curShiftTime) / interface_1.shiftInMS;
        }, 0));
}
function calculateTreshold(sumStudents, sumShifts) {
    // return (
    //   1 /
    //   ((sumStudents * (Math.floor(sumShifts / sumStudents) - 1)) /
    //     (Math.floor(sumShifts / sumStudents) + 1))
    // );
    return 1 / (sumStudents - 1);
}
//#region nothing to see here ...
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
//#endregion
