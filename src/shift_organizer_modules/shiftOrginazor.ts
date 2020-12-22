import {
  IPreference,
  IStudent,
  IOrganizedShiftDay,
  IShift,
  IShiftManager,
} from "./utils/interface";
import { flatMap, flatten } from "lodash";
import { Preference, Shift, Student } from "./utils/Entities";

export default class ShiftManager implements IShiftManager {
  students: IStudent[] = [];
  addStudent(name: string): void {
    throw new Error("Method not implemented.");
  }
  removeStudent(name: string): void {
    throw new Error("Method not implemented.");
  }
  getStudent(name: string): IStudent {
    throw new Error("Method not implemented.");
  }
  addPreferenceToStudent(
    name: string,
    available: boolean,
    shift: IShift
  ): void {
    throw new Error("Method not implemented.");
  }
  removePreferenceFromStudent(name: string, shift: IShift): void {
    throw new Error("Method not implemented.");
  }
  shifts: IShift[] = [];

  getShift(day: number, time: string): IShift {
    throw new Error("Method not implemented.");
  }
  assignStudentToShift(student: IStudent, shift: IShift): void {
    throw new Error("Method not implemented.");
  }
  organize(students: IStudent[], weeks: number = 4): IOrganizedShiftDay[] {
    if (students.length < 7) throw "at least 7 students are needed!";

    const shifts: IOrganizedShiftDay[] = initShifts();
    const availablePreferences: IPreference[] = [];
    const unavailablePreferences: IPreference[] = [];
    // will help to keep track of the students number of shifts
    // const numberOfShiftsOfStudent: { name: string; counter: number }[] = students.map(
    //   (student: IStudent) => {
    //     return { name: student.name, counter: 0 };
    //   }
    // );
    const numberOfShiftsOfStudent: any = students.reduce(
      (prev, student: IStudent) => {
        //TODO fix this
        //@ts-ignore
        prev[student.name] = 0;
        return prev;
      },
      {}
    );

    students.forEach((student: IStudent) =>
      student.preferences.forEach((preference: IPreference) => {
        if (preference.available) {
          availablePreferences.push(preference);
        } else {
          unavailablePreferences.push(preference);
        }
      })
    );

    //first, assign all available preferences
    availablePreferences.forEach((pref: IPreference) => {
      //TODO fix this
      // @ts-ignore
      const desiredShift: IShift = shifts[pref.shift.day][pref.shift.time];
      if (desiredShift.chosen) return;
      desiredShift.assignStudent(pref.student);
      pref.handled = true;
      //TODO fix this
      //@ts-ignore
      numberOfShiftsOfStudent[pref.student] += 1;
    });

    // assign all unavailable preferences
    unavailablePreferences.forEach((pref: IPreference) => {
      //TODO fix this
      //@ts-ignore
      const undesiredShift: IShift = shifts[pref.shift.day][pref.shift.time];
      undesiredShift.addUnavailable(pref.student);
      pref.handled = true;
    });

    // assign all other students to shifts
    //min conflicts
    return minConflicts(shifts, 35);
  }
}

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
function minConflicts(
  csp: IOrganizedShiftDay[],
  maxSteps: number
): IOrganizedShiftDay[] {
  let current = csp;

  for (let i = 1; i < maxSteps; i++) {
    console.log(i);
    if (shiftsAreOrganized(current)) return current;
    let randomConflict = getRandomConflict(csp);
    let value = minimizeConflictsIn(randomConflict);

    if (randomConflict.chosen) {
      randomConflict.chosen.removeShift(randomConflict);
    }
    randomConflict.assignStudent(value);
    value.addShift(randomConflict);
  }

  return current;
}

function shiftsAreOrganized(currentState: IOrganizedShiftDay[]): boolean {
  // checks if current shifts in state are fine organized:
  // * no students are assigned to shifts where they appear unavailable
  // * no student has two straight shifts - MISSING
  // * all shifts are assigned
  let legal = true;

  // currentState.forEach((shiftDay: IOrganizedShiftDay) => {
  for (let shiftDay of currentState) {
    // Object.keys(shiftDay).forEach((key: string) => {

    for (let curShift of shiftDay.getAllShifts()) {
      // @ts-ignore
      // for (let cushift in shiftDay) let curShift: IShift = shiftDay[key];

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

function getRandomConflict(csp: IOrganizedShiftDay[]): IShift {
  // get a random unassigned shift
  let availableShifts: IShift[] = flatMap(csp, (shiftDay: IOrganizedShiftDay) =>
    shiftDay.getAllShifts()
  ).filter((shift: IShift) => !shift.chosen);

  if (!availableShifts.length) {
    availableShifts = flatMap(csp, (shiftDay: IOrganizedShiftDay) =>
      shiftDay.getAllShifts()
    ).filter((shift: IShift) => getConflicts(shift.chosen!, shift) >= 4);

    console.log("happend");
  }

  console.log(availableShifts.length);
  return availableShifts[Math.floor(Math.random() * availableShifts.length)];
}

function minimizeConflictsIn(conflictedShift: IShift): IStudent {
  // assign a student that will minimize the conflicts
  const conflictsOfStudents: {
    conflicts: number;
    student: IStudent;
  }[] = students.map((student: IStudent) => {
    return { conflicts: getConflicts(student, conflictedShift), student };
  });

  const leastConflictedStudent: {
    conflicts: number;
    student: IStudent;
  } = conflictsOfStudents.sort((a, b) => a.conflicts - b.conflicts)[0];

  console.log(leastConflictedStudent);
  return leastConflictedStudent.student;
}

function getConflicts(student: IStudent, shift: IShift): number {
  // 3 pts if unavailable for this shift
  // a point for each shift he has
  // 2 points for each shift in a row
  let conflictPts = 0;

  if (shift.unavailable.includes(student)) conflictPts += 3;

  conflictPts += student.shifts.length;

  conflictPts += student.shifts.reduce(
    (sum: number, cShift: IShift) =>
      shift.day === cShift.day ||
      shift.day + 1 === cShift.day ||
      shift.day - 1 === cShift.day
        ? sum * 2
        : sum,
    2
  );

  return conflictPts;
}

function initShifts(): IOrganizedShiftDay[] {
  class OrginizedShiftDay implements IOrganizedShiftDay {
    private morning: IShift;
    private noon: IShift;
    private evening: IShift;

    constructor(morning: IShift, noon: IShift, evening: IShift) {
      this.morning = morning;
      this.noon = noon;
      this.evening = evening;
    }

    getMorning(): IShift {
      return this.morning;
    }
    getNoon(): IShift {
      return this.noon;
    }
    getEvening(): IShift {
      return this.evening;
    }
    getAllShifts(): IShift[] {
      return [this.morning, this.noon, this.evening];
    }
  }

  // return [0, 1, 2, 3, 4, 5, 6].map((day: number) => {
  // return {
  // getMorning: () => new Shift(day, "morning"),
  //
  // morning: new Shift(day, "morning"),
  // noon: new Shift(day, "noon"),
  // evening: new Shift(day, "evening"),
  // getShiftIterator: () => [],
  // };
  // });
  // }

  return [0, 1, 2, 3, 4, 5, 6].map((day: number) => {
    return new OrginizedShiftDay(
      new Shift(day, "morning"),
      new Shift(day, "noon"),
      new Shift(day, "evening")
    );
  });
}

const names: string[] = [
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
const getRandomDay: () => number = () => Math.floor(Math.random() * 7);
const getShift: () => string = () =>
  ["morning", "noon", "evening"][Math.floor(Math.random() * 3)];
const getAvailable: () => boolean = () =>
  Boolean(Math.floor(Math.random() * 2));

const students: IStudent[] = names.map((name: string) => {
  const newStudent: IStudent = new Student(name);
  const pref: IPreference = new Preference(
    newStudent,
    { day: getRandomDay(), time: getShift() },
    getAvailable()
  );
  newStudent.addPreference(pref);
  return newStudent;
});

const sm = new ShiftManager();
console.log(sm.organize(students, 3).forEach((day) => console.log(day)));
students.forEach((student) => student.printPreferences());
