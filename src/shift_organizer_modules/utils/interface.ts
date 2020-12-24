export interface IShift {
  day: number;
  week: number;
  time: string;
  unavailable: IStudent[];
  chosen: undefined | IStudent;
  assignStudent(student: IStudent): void;
  addUnavailable(student: IStudent): void;
  isStudentUnavailable(student: IStudent): void;
  printUnavailable(): void;
}

export interface IStudent {
  name: string;
  shifts: IShift[];
  preferences: IPreference[];

  addShift(shift: IShift): void;
  removeShift(shift: IShift): void;
  printShifts(): void;
  addPreference(preference: IPreference): void;
  removePreference(shift: IShift): void;
  printPreferences(): void;
}

export interface IPreference {
  student: IStudent;
  available: boolean;
  shift: IPreferenceShift;
  handled: boolean;
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
  organize(students: IStudent[], weeks: number): IOrganizedShiftDay[][]; // remove students from organize
  addStudent(name: string): IStudent | undefined;
  removeStudent(name: string): void;
  getStudent(name: string): IStudent | undefined;
  getShift(day: number, week: number, time: string): IShift | undefined;
  assignStudentToShift(student: IStudent, shift: IShift): void;
  addPreferenceToStudent(name: string, available: boolean, shift: IShift): void;
  removePreferenceFromStudent(name: string, shift: IShift): void;
}
