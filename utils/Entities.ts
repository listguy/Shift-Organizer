import { IShift, IStudent, IPreference } from "./interface";

class Shift implements IShift {
  day: number;
  time: string;
  unavailable: IStudent[] = [];
  chosen: IStudent | undefined;

  constructor(day: number, time: string) {
    this.day = day;
    this.time = time;
  }

  addUnavailable(student: IStudent) {
    this.unavailable.push(student);
  }
}
