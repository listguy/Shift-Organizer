export interface IShift {
  day: number;
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
  printShifts(): void;
  addPreference(preference: IPreference): void;
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
  time: string;
}

export interface IOrganizedShiftDay {
  morning: IShift;
  noon: IShift;
  evening: IShift;
}
