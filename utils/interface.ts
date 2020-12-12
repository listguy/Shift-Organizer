export interface IShift {
  day: number;
  time: string;
  unavailable: IStudent[];
  chosen: undefined | IStudent;
}

export interface IStudent {
  name: String;
  shifts: IShift[];
}

export interface IPreference {
  student: IStudent;
  available: boolean;
  shift: IShift;
}
