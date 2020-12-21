import {
  IPreference,
  IStudent,
  IOrganizedShiftDay,
  IShift,
} from "./utils/interface";
import { flatMap, flatten } from "lodash";
import { Preference, Shift, Student } from "./utils/Entities";

export default function orginizeShifts(
  students: IStudent[]
): IOrganizedShiftDay[] {
  // returns 21 organized shifts (for week)
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
  for (let shiftDay in currentState) {
    // Object.keys(shiftDay).forEach((key: string) => {
    for (let key in Object.keys(shiftDay)) {
      // @ts-ignore
      let curShift: IShift = shiftDay[key];

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
  let availableShifts: IShift[] = flatMap(
    csp,
    (shiftDay: IOrganizedShiftDay) => [
      shiftDay.morning,
      shiftDay.noon,
      shiftDay.evening,
    ]
  ).filter((shift: IShift) => !shift.chosen);

  if (!availableShifts.length) {
    availableShifts = flatMap(csp, (shiftDay: IOrganizedShiftDay) => [
      shiftDay.morning,
      shiftDay.noon,
      shiftDay.evening,
    ]).filter((shift: IShift) => getConflicts(shift.chosen!, shift) >= 4);
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
  return [0, 1, 2, 3, 4, 5, 6].map((day: number) => {
    return {
      morning: new Shift(day, "morning"),
      noon: new Shift(day, "noon"),
      evening: new Shift(day, "evening"),
    };
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

console.log(orginizeShifts(students).forEach((day) => console.log(day)));
students.forEach((student) => student.printPreferences());
