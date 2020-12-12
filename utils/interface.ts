export interface IShift {
  day: number;
  time: string;
  unavailable: IStudent[];
  chosen: undefined | IStudent;
  addUnavailable(student: IStudent): void;
  printUnavailable(): void;
}

export interface IStudent {
  name: String;
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
  shift: IShift;
}

export interface IOrganizedShiftDay {
  morning: IShift;
  noon: IShift;
  evening: IShift;
}
