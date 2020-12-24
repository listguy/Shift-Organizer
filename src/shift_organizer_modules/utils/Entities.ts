import {
  IShift,
  IStudent,
  IPreference,
  IPreferenceShift,
  IOrganizedShiftDay,
} from "./interface";

export class Shift implements IShift {
  day: number;
  week: number;
  time: string;
  unavailable: IStudent[] = [];
  chosen: IStudent | undefined;

  constructor(day: number, week: number, time: string) {
    this.day = day;
    this.week = week;
    this.time = time;
  }

  assignStudent(student: IStudent) {
    this.chosen = student;
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
}

export class Student implements IStudent {
  name: string;
  shifts: IShift[] = [];
  preferences: IPreference[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addShift(shift: IShift) {
    this.shifts.push(shift);
  }

  removeShift(shift: IShift) {
    this.shifts = this.shifts.filter((s: IShift) => s != shift);
  }

  printShifts() {
    const formated: Partial<IShift>[] = this.shifts.map((shift: IShift) => {
      return { day: shift.day, time: shift.time };
    });
    console.log(formated);
  }

  addPreference(preference: IPreference) {
    this.preferences.push(preference);
  }

  removePreference(shift: IShift): void {
    const prefIndex: number = this.preferences.findIndex(
      (pref: IPreference) => pref.shift === shift
    );

    if (!prefIndex) {
      throw "Student doe sno have a preference for this shift";
    }

    this.preferences.splice(prefIndex, 1);
  }

  printPreferences() {
    this.preferences.map((preference: IPreference) => console.log(preference));
  }
}

export class Preference implements IPreference {
  student: IStudent;
  shift: IPreferenceShift;
  available: boolean;
  handled: boolean;

  constructor(student: IStudent, shift: IPreferenceShift, available: boolean) {
    this.student = student;
    this.shift = shift;
    this.available = available;
    this.handled = false;
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
