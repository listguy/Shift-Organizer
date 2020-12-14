import { IShift, IStudent, IPreference, IPreferenceShift } from "./interface";

export class Shift implements IShift {
  day: number;
  time: string;
  unavailable: IStudent[] = [];
  chosen: IStudent | undefined;

  constructor(day: number, time: string) {
    this.day = day;
    this.time = time;
  }

  assignStudent(student: IStudent) {
    this.chosen = student;
  }

  addUnavailable(student: IStudent) {
    this.unavailable.push(student);
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

  printShifts() {
    const formated: Partial<IShift>[] = this.shifts.map((shift: IShift) => {
      return { day: shift.day, time: shift.time };
    });
    console.log(formated);
  }

  addPreference(preference: IPreference) {
    this.preferences.push(preference);
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

// let s1 = new Shift(1, "a");
// let s2 = new Shift(2, "b");

// s1.addUnavailable(new Student("bob"));
// s2.addUnavailable(new Student("mo"));

// console.log(s1.unavailable);
// console.log(s2.unavailable);
