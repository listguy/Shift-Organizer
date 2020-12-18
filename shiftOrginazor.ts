import {
  IPreference,
  IStudent,
  IOrganizedShiftDay,
  IShift,
} from "./utils/interface";
import { flatten } from "lodash";
import { Preference, Shift, Student } from "./utils/Entities";
function orginizeShifts(students: IStudent[]): IOrganizedShiftDay[] {
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
    //@ts-ignore
    const desiredShift: IShift = shifts[pref.shift.day][pref.shift.time];
    if (desiredShift.chosen) return;
    desiredShift.assignStudent(pref.student);
    pref.handled = true;
    //TODO fix this
    //@ts-ignore
    numberOfShiftsOfStudent[pref.student];
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
  shifts.forEach((shiftsDay: IOrganizedShiftDay) => {
    Object.keys(shiftsDay).forEach((key: string) => {
      //TODO fix type
      //@ts-ignore
      const currentShift = shiftsDay[key];
      for (let student of students) {
        if (currentShift.chosen) continue;
        if (currentShift.isStudentUnavailable(student)) continue;
        if (numberOfShiftsOfStudent[student.name] === 3) continue;
        currentShift.assignStudent(student);
        numberOfShiftsOfStudent[student.name] += 1;
        break;
      }
      if (!currentShift.chosen) throw "a Shift with no student! stopping";
    });
  });

  return shifts;
}

//Min conflicts Algo pseudo code
/*function MinConflicts(csp:any, max_steps:number) {
  //csp: 
  //max_steps: number of steps before giving up

  for(let i=1; i< max_steps; i++) {
    if current is a solution for csp
      return current
    const randomVar = randomly chosen conflicted variable in csp
    const value = the value for randomVar that minimizes conflicts
    set var = value in current
  }

  return failure
} */

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
// students.forEach((student) => student.printPreferences());
