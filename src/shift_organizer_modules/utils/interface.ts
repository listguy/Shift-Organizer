export interface IShift {
  day: number;
  week: number;
  time: string;
  timeStamp: number;
  isSpecial: boolean;
  unavailable: IStudent[];
  chosen: undefined | IStudent;
  assignStudent(student: IStudent): void;
  unassignStudent(): void;
  addUnavailable(student: IStudent): void;
  isStudentUnavailable(student: IStudent): boolean;
  isAdjacent(otherShift: IShift | undefined): boolean;
  hasSameStudent(otherShift: IShift | undefined): boolean;
  prettyPrintTime(): string;
  printUnavailable(): void;
}

export interface IStudent {
  name: string;
  shifts: IShift[];
  preferences: IPreference[];

  addShift(shift: IShift): void;
  removeShift(shift: IShift): void;
  printShifts(): void;
  // hasPreference(pref: IPreference): boolean;
  hasPreference(stamp: number, available: boolean): boolean;
  addPreference(preference: IPreference): boolean | Error;
  removePreference(shiftToRemoveTimestamp: number): void;
  getPreference(stamp: number, available: boolean): IPreference | undefined;
  getPreferences(): IPreference[];
  handlePrefOfShift(shift: IShift, toggle: "assign" | "unassign"): void;
  printPreferences(): void;
}

export interface IPreference {
  student: IStudent;
  available: boolean;
  shiftTimeStamp: number;
  handled: boolean;

  getTimeObject(): IPreferenceShift;
  getTimeString(): string;
  // didHandle(): boolean;
}

export interface IPreferenceShift {
  day: number;
  week: number;
  time: string;
}

export interface IOrganizedShiftDay {
  getMorning(): IShift;
  getNoon(): IShift;
  getEvening(): IShift;
  getAllShifts(): IShift[];
  getShiftByTime(time: string): IShift | undefined;
}

export interface IShiftManager {
  shifts: IOrganizedShiftDay[][];
  students: IStudent[];
  HeuristicTreshold: number;
  organize(): IOrganizedShiftDay[][];
  getWarnings(): string[];
  addStudent(name: string): IStudent | undefined;
  removeStudent(name: string): void;
  getStudent(name: string): IStudent | undefined;
  getAllStudents(): IStudent[];
  getShift(day: number, week: number, time: string): IShift | undefined;
  getShiftByStamp(timestamp: number): IShift | undefined;
  getAllShifts(): IOrganizedShiftDay[][];
  assignStudentToShift(student: IStudent, shift: IShift): void;
  addPreferenceToStudent(
    name: string,
    available: boolean,
    shiftTimeStamp: number
  ): void | boolean;
  removePreferenceFromStudent(
    name: string,
    shiftTimeStamp: number
  ): void | boolean;
}

export const hourInMS = 1000 * 60 * 60;
export const dayInMS = 24 * hourInMS;
export const weekInMs = 7 * dayInMS;
export const shiftInMS = 8 * hourInMS;
