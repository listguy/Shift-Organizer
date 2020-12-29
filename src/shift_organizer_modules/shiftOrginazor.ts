import {
  IPreference,
  IStudent,
  IOrganizedShiftDay,
  IShift,
  IShiftManager,
  shiftInMS,
  weekInMs,
  dayInMS,
} from "./utils/interface";
import {
  capitalize,
  flatMap,
  flatMapDeep,
  flatMapDepth,
  flatten,
} from "lodash";
import {
  OrginizedShiftDay,
  Preference,
  Shift,
  Student,
} from "./utils/Entities";
import { debug, error, timeStamp } from "console";

export default class ShiftManager implements IShiftManager {
  students: IStudent[] = [];
  shifts: IOrganizedShiftDay[][] = [];
  HeuristicTreshold: number;
  WeekendTreshold: number;

  constructor() {
    this.initShifts();
    this.HeuristicTreshold = 0;
    this.WeekendTreshold = 0;
  }

  addStudent(name: string): IStudent | undefined {
    name = capitalize(name.toLowerCase());
    const exist: boolean =
      this.students.findIndex((student: IStudent) => student.name === name) !==
      -1;

    if (exist) {
      throw new Error("Student already exist");
    }

    const newStudent: IStudent = new Student(name);
    this.students.push(newStudent);

    this.HeuristicTreshold = calculateTreshold(
      this.students.length,
      this.shifts.length * 7
    );

    this.WeekendTreshold = (4 * 6) / this.students.length;

    return newStudent;
  }

  removeStudent(name: string): void {
    name = capitalize(name.toLowerCase());
    const indexOfStudent = this.students.findIndex(
      (student: IStudent) => student.name === name
    );

    if (indexOfStudent === -1) {
      throw new Error("Student does not exist");
    }

    this.students.splice(indexOfStudent, 1);
    this.syncShiftsAndStudents();
    this.HeuristicTreshold = calculateTreshold(
      this.students.length,
      this.shifts.length * 7
    );
    this.WeekendTreshold = (4 * 6) / this.students.length;

    return;
  }

  getStudent(name: string): IStudent | undefined {
    name = capitalize(name.toLowerCase());
    return this.students.find((student: IStudent) => student.name === name);
  }

  getAllStudents(): IStudent[] {
    return this.students.slice();
  }

  addPreferenceToStudent(
    name: string,
    available: boolean,
    shiftTimestamp: number
  ): void | boolean {
    const student: IStudent | undefined = this.students.find(
      (student: IStudent) => student.name === name
    );

    if (!student) {
      throw new Error("Student does not exist");
    }

    if (
      shiftTimestamp < 0 ||
      shiftTimestamp > 4 * weekInMs ||
      shiftTimestamp % shiftInMS !== 0
    ) {
      throw new Error(
        `Timestamp is ilegal. Check it is positive, not larger than ${
          4 * weekInMs
        } and points to the begining of the shift`
      );
    }

    const newPref: IPreference = new Preference(
      student,
      shiftTimestamp,
      available
    );
    try {
      student.addPreference(newPref);
      return true;
    } catch (e) {
      throw e;
    }
  }

  removePreferenceFromStudent(
    name: string,
    shiftToRemoveTimestamp: number
  ): void | boolean {
    const student: IStudent | undefined = this.students.find(
      (student: IStudent) => student.name === name
    );

    if (!student) {
      throw new Error("Student does not exist");
    }

    if (
      shiftToRemoveTimestamp < 0 ||
      shiftToRemoveTimestamp > 4 * weekInMs ||
      shiftToRemoveTimestamp % shiftInMS !== 0
    ) {
      throw new Error(
        `Timestamp is ilegal. Check it is positive, not larger than ${
          4 * weekInMs
        } and points to the begining of the shift`
      );
    }

    try {
      student.removePreference(shiftToRemoveTimestamp);
      return true;
    } catch (e) {
      throw e;
    }
  }

  getShift(week: number, day: number, time: string): IShift | undefined {
    // return this.shifts.find(
    //   (shift: IShift) => shift.day === day && shift.time === time
    // );
    if (!this.shifts[week - 1]) return undefined;
    return this.shifts[week - 1][day - 1]?.getShiftByTime(time);
  }

  getShiftByStamp(stamp: number): IShift | undefined {
    const week: number = Math.floor(stamp / weekInMs);
    const day: number = Math.floor((stamp - weekInMs * week) / dayInMS);
    const shiftIndex: number = Math.floor(
      (stamp - week * weekInMs - day * dayInMS) / shiftInMS
    );
    const time: string =
      shiftIndex === 0 ? "morning" : shiftIndex === 1 ? "noon" : "evening";

    return this.getShift(week + 1, day + 1, time);
  }

  getAllShifts(): IOrganizedShiftDay[][] {
    return this.shifts.slice();
  }

  assignStudentToShift(student: IStudent, shift: IShift): void {
    shift.unassignStudent();
    shift.assignStudent(student);
  }

  organize(): IOrganizedShiftDay[][] {
    // this.initShifts();
    const shifts: IOrganizedShiftDay[][] = this.shifts;
    const students: IStudent[] = this.students;
    const availablePreferences: IPreference[] = [];
    const unavailablePreferences: IPreference[] = [];
    // will help to keep track of the students number of shifts
    // const numberOfShiftsOfStudent: { name: string; counter: number }[] = students.map(
    //   (student: IStudent) => {
    //     return { name: student.name, counter: 0 };
    //   }
    // );
    console.log(students);
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
      const {
        week,
        day,
        time,
      }: { week: number; day: number; time: string } = pref.getTimeObject();

      // const desiredShift: IShift = shifts[week][day].getShiftByTime(time)!;
      const desiredShift: IShift = this.getShift(week + 1, day + 1, time)!;
      if (desiredShift.chosen) {
        // if chosen sudent has the current pref, continue
        if (desiredShift.chosen.hasPreference(pref)) return;
      }
      // desiredShift.assignStudent(pref.student);
      this.assignStudentToShift(pref.student, desiredShift);
      pref.handled = true;
      //TODO fix this
      //@ts-ignore
      numberOfShiftsOfStudent[pref.student] += 1;
    });

    // assign all unavailable preferences
    unavailablePreferences.forEach((pref: IPreference) => {
      const {
        week,
        day,
        time,
      }: { week: number; day: number; time: string } = pref.getTimeObject();

      const undesiredShift: IShift = shifts[week][day].getShiftByTime(time)!;
      undesiredShift.addUnavailable(pref.student);
      pref.handled = true;
    });

    // assign all other students to shifts
    const organizedShifts: IOrganizedShiftDay[][] = minConflicts(
      shifts,
      students,
      1000,
      this.HeuristicTreshold,
      this
    );
    this.shifts = organizedShifts;
    console.log(this.HeuristicTreshold);
    return organizedShifts;
  }

  // returns all problems with current solution
  getWarnings(): string[] {
    // Possible problems:
    // - 2 shifts in a row
    // - too many weekend shifts
    // - assigned to a shift he asked not to

    const problems: string[] = [];

    for (let student of this.students) {
      let weekendCounter: number = 0;
      student.shifts.sort((a: IShift, b: IShift) => a.timeStamp - b.timeStamp);

      for (let i: number = 0; i < student.shifts.length; i++) {
        if (student.shifts[i].isAdjacent(student.shifts[i + 1]))
          problems.push(
            `Student ${student.name} has consecutive shifts on ${student.shifts[
              i
            ].prettyPrintTime()}`
          );
        if (student.shifts[i].isStudentUnavailable(student))
          problems.push(
            `Student ${student.name} was assigned a shift on ${student.shifts[
              i
            ].prettyPrintTime()}, but preferes not to`
          );
        if (student.shifts[i].isSpecial) weekendCounter++;
      }
      if (weekendCounter > this.WeekendTreshold + 1)
        problems.push(
          `Student ${
            student.name
          } Has ${weekendCounter} weekend Shifts. ${Math.floor(
            weekendCounter - this.WeekendTreshold
          )} more than allowed.`
        );
    }

    return problems;
  }

  private initShifts(): void {
    this.shifts = [0, 1, 2, 3].map((week: number) =>
      [0, 1, 2, 3, 4, 5, 6].map((day: number) => {
        return day >= 5
          ? new OrginizedShiftDay(
              new Shift(day, week, "morning", true),
              new Shift(day, week, "noon", true),
              new Shift(day, week, "evening", true)
            )
          : new OrginizedShiftDay(
              new Shift(day, week, "morning"),
              new Shift(day, week, "noon"),
              new Shift(day, week, "evening")
            );
      })
    );
  }

  private syncShiftsAndStudents(): void {
    //Unassigns students who no longer exist in student list from shifts
    // this.shifts = this.shifts.map((shiftsWeek:IOrganizedShiftDay[])=>shiftsWeek.map((shiftDay:IOrganizedShiftDay)=>shift))
    for (let weekShifts of this.shifts) {
      for (let dayShifts of weekShifts) {
        for (let shift of dayShifts.getAllShifts()) {
          if (!shift.chosen) continue;
          if (!this.students.includes(shift.chosen)) {
            shift.unassignStudent();
          }
        }
      }
    }
  }

  private cloneShifts(): IOrganizedShiftDay[][] {
    // created a copy for min conflicts to work on and modify.
    return this.shifts.map((shiftsWeek: IOrganizedShiftDay[]) =>
      shiftsWeek.map(
        (shiftsDay) =>
          new OrginizedShiftDay(
            undefined,
            undefined,
            undefined,
            ...shiftsDay
              .getAllShifts()
              .map(
                (shift: IShift) =>
                  new Shift(shift.day, shift.week, shift.time, shift.isSpecial)
              )
          )
      )
    );
  }

  private cloneStudents(): IStudent[] {
    return this.students.map((student: IStudent) => {
      const copyStudent = new Student(student.name);
      return copyStudent;
    });
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
  csp: IOrganizedShiftDay[][],
  students: IStudent[],
  maxSteps: number,
  treshold: number,
  SM: IShiftManager
): IOrganizedShiftDay[][] {
  let current = csp;

  for (let i = 1; i < maxSteps; i++) {
    console.log(i);
    if (shiftsAreOrganized(current, treshold, SM)) return current;
    let randomConflict = getRandomConflict(csp, treshold);
    let value = minimizeConflictsIn(randomConflict, students);

    SM.assignStudentToShift(value, randomConflict);
  }

  return current;
}

function shiftsAreOrganized(
  currentState: IOrganizedShiftDay[][],
  treshold: number,
  SM: IShiftManager
): boolean {
  // checks if current shifts in state are fine organized:
  let legal = true;
  for (let shiftWeek of currentState) {
    for (let shiftDay of shiftWeek) {
      for (let curShift of shiftDay.getAllShifts()) {
        if (!curShift.chosen) {
          legal = false;
          break;
        }
        if (curShift.isStudentUnavailable(curShift.chosen)) {
          legal = false;
          break;
        }
        const nextShift = SM.getShiftByStamp(curShift.timeStamp + shiftInMS);
        const prevShift = SM.getShiftByStamp(curShift.timeStamp - shiftInMS);

        if (
          curShift.hasSameStudent(nextShift) ||
          curShift.hasSameStudent(prevShift)
        ) {
          legal = false;
          break;
        }
      }
    }
  }
  return legal;
}

function getRandomConflict(
  csp: IOrganizedShiftDay[][],
  treshold: number
): IShift {
  // get a random unassigned shift
  let availableShifts: IShift[] = flatMapDepth(
    csp,
    (shiftWeek: IOrganizedShiftDay[]) =>
      shiftWeek.map((shiftDay: IOrganizedShiftDay) => shiftDay.getAllShifts()),
    2
  ).filter((shift: IShift) => !shift.chosen);

  if (!availableShifts.length) {
    availableShifts = flatMapDepth(
      csp,
      (shiftWeek: IOrganizedShiftDay[]) =>
        shiftWeek.map((shiftDay: IOrganizedShiftDay) =>
          shiftDay.getAllShifts()
        ),
      2
    ).filter(
      (shift: IShift, index: number, shiftsArr: IShift[]) =>
        shift.hasSameStudent(shiftsArr[index + 1]) ||
        shift.hasSameStudent(shiftsArr[index - 1]) ||
        shift.isStudentUnavailable(shift.chosen!)
    );
  }

  if (availableShifts.length === 0) {
    console.log("Should have quit!");
  }
  return availableShifts[Math.floor(Math.random() * availableShifts.length)];
}

function minimizeConflictsIn(
  conflictedShift: IShift,
  students: IStudent[]
): IStudent {
  // assign a student that will minimize the conflicts
  const conflictsOfStudents: {
    conflicts: number;
    student: IStudent;
  }[] = students.map((student: IStudent) => {
    return { conflicts: getConflictsWith(student, conflictedShift), student };
  });

  const leastConflictedStudent: {
    conflicts: number;
    student: IStudent;
  } = conflictsOfStudents.sort((a, b) => a.conflicts - b.conflicts)[0];

  console.log(leastConflictedStudent);
  return leastConflictedStudent.student;
}

function getConflictsWith(student: IStudent, shift: IShift): number {
  // sum of shift count between the student's shifts
  if (student.shifts.length <= 1) {
    return shift.isAdjacent(student.shifts[0]) ? 1 : 0;
  }

  if (shift.isStudentUnavailable(student)) return 1;

  const distanceBetweenShifts: number = student.shifts
    .map((shift: IShift) => shift.timeStamp)
    .concat(shift.timeStamp)
    .sort((a: number, b: number) => a - b)
    .reduce(
      (
        sum: number,
        curShiftTime: number,
        index: number,
        shiftsArr: number[]
      ) => {
        // console.log(shiftsArr);
        if (index === shiftsArr.length - 1) return sum;
        return sum + (shiftsArr[index + 1] - curShiftTime) / shiftInMS;
      },
      0
    );

  return 1 / (distanceBetweenShifts / student.shifts.length);
}

function evaluateCurrentShiftsOf(student: IStudent) {
  if (student.shifts.length <= 1) return 1;

  return (
    1 /
    student.shifts
      .map((shift: IShift) => shift.timeStamp)
      .sort((a: number, b: number) => a - b)
      .reduce(
        (
          sum: number,
          curShiftTime: number,
          index: number,
          shiftsArr: number[]
        ) => {
          // console.log(shiftsArr);
          if (index === shiftsArr.length - 1) return sum;
          return sum + (shiftsArr[index + 1] - curShiftTime) / shiftInMS;
        },
        0
      )
  );
}

function calculateTreshold(sumStudents: number, sumShifts: number): number {
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
