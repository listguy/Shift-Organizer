import {
  IShift,
  IStudent,
  IPreference,
  IPreferenceShift,
  IOrganizedShiftDay,
  weekInMs,
  dayInMS,
  shiftInMS,
} from "./interface";

const daysInWeek: string[] = [
  "Sunday",
  "Monday",
  "Tuseday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export class Shift implements IShift {
  day: number;
  week: number;
  time: string;
  timeStamp: number;
  isSpecial: boolean;
  unavailable: IStudent[] = [];
  chosen: IStudent | undefined;

  constructor(day: number, week: number, time: string, special = false) {
    this.day = day;
    this.week = week;
    this.time = time;
    this.isSpecial = special;

    this.timeStamp =
      week * weekInMs +
      day * dayInMS +
      shiftInMS * (time === "morning" ? 0 : time === "noon" ? 1 : 2);
  }

  assignStudent(student: IStudent) {
    this.chosen = student;
    student.addShift(this);
  }

  unassignStudent() {
    this.chosen?.removeShift(this);
    this.chosen = undefined;
  }

  addUnavailable(student: IStudent) {
    this.unavailable.push(student);
  }

  isStudentUnavailable(student: IStudent) {
    return this.unavailable.includes(student);
  }

  printUnavailable() {
    const formated: string[] = this.unavailable.map(
      (student: IStudent) => student.name as string
    );
    console.log(formated);
  }

  isAdjacent(otherShift: IShift | undefined): boolean {
    if (otherShift instanceof Shift === false) return false;
    return (
      otherShift!.timeStamp === this.timeStamp - shiftInMS ||
      otherShift!.timeStamp === this.timeStamp + shiftInMS
    );
  }

  hasSameStudent(otherShift: IShift | undefined): boolean {
    if (otherShift instanceof Shift === false) return false;
    return otherShift!.chosen === this.chosen;
  }

  prettyPrintTime(): string {
    return `${daysInWeek[this.day]}, ${this.time} week ${this.week + 1}`;
  }
}

export class Student implements IStudent {
  name: string;
  shifts: IShift[] = [];
  preferences: IPreference[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addShift(shift: IShift): void {
    this.shifts.push(shift);
  }

  removeShift(shift: IShift): void {
    this.shifts = this.shifts.filter((s: IShift) => s != shift);
  }

  printShifts() {
    const formated: Partial<IShift>[] = this.shifts.map((shift: IShift) => {
      return { day: shift.day, time: shift.time };
    });
    console.log(formated);
  }

  hasPreference(pref: IPreference): boolean {
    return (
      this.preferences.findIndex(
        (p: IPreference) =>
          p.getTimeString() === pref.getTimeString() &&
          p.available === pref.available
      ) !== -1
    );
  }

  addPreference(preference: IPreference): Error | boolean {
    if (preference instanceof Preference === false)
      throw new Error(
        `Expected an object of type Preferene but got ${typeof preference} instead`
      );

    if (
      this.preferences.find(
        (pref: IPreference) => pref.shiftTimeStamp === preference.shiftTimeStamp
      )
    ) {
      throw new Error(
        `A Preference in this time already exists for this student`
      );
    }
    this.preferences.push(preference);
    return true;
  }

  removePreference(shiftToRemoveTimestamp: number): void {
    const prefIndex: number = this.preferences.findIndex(
      (pref: IPreference) => pref.shiftTimeStamp === shiftToRemoveTimestamp
    );

    if (prefIndex === -1) {
      throw new Error("Student does not have a preference for this shift");
    }
    console.log("here");
    this.preferences.splice(prefIndex, 1);
  }

  getPreferences(): IPreference[] {
    return this.preferences.slice();
  }

  printPreferences() {
    this.preferences.map((preference: IPreference) => console.log(preference));
  }
}

export class Preference implements IPreference {
  student: IStudent;
  shiftTimeStamp: number;
  available: boolean;
  handled: boolean;

  constructor(student: IStudent, shiftTimeStamp: number, available: boolean) {
    this.student = student;
    this.shiftTimeStamp = shiftTimeStamp;
    this.available = available;
    this.handled = false;
  }

  getTimeObject() {
    const week: number = Math.floor(this.shiftTimeStamp / weekInMs);
    const day: number = Math.floor(
      (this.shiftTimeStamp - weekInMs * week) / dayInMS
    );
    const shiftIndex: number = Math.floor(
      (this.shiftTimeStamp - week * weekInMs - day * dayInMS) / shiftInMS
    );
    const time: string =
      shiftIndex === 0 ? "morning" : shiftIndex === 1 ? "noon" : "evening";

    return { week, day, time };
  }

  getTimeString() {
    const { week, day, time } = this.getTimeObject();
    return `${daysInWeek[day]}, ${time}, week ${week + 1}`;
  }
}

export class OrginizedShiftDay implements IOrganizedShiftDay {
  private morning: IShift;
  private noon: IShift;
  private evening: IShift;

  constructor(
    morning?: IShift,
    noon?: IShift,
    evening?: IShift,
    ...arr: IShift[]
  ) {
    this.morning = morning || arr[0];
    this.noon = noon || arr[1];
    this.evening = evening || arr[2];
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
  getShiftByTime(time: string): IShift | undefined {
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

// let s1 = new Shift(1, "a");
// let s2 = new Shift(2, "b");

// s1.addUnavailable(new Student("bob"));
// s2.addUnavailable(new Student("mo"));

// console.log(s1.unavailable);
// console.log(s2.unavailable);
