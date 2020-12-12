import { IPreference, IStudent, IOrganizedShiftDay } from "./utils/interface";
import { flatten } from "lodash";
import { Shift } from "./utils/Entities";
function orginizeShift(students: IStudent[]): IOrganizedShiftDay[] {
  // returns 21 organized shifts (for week)
  if (students.length < 7) throw "at least 7 students are needed!";

  const shifts: IOrganizedShiftDay[] = [];
  const availablePreferences: IPreference[] = [];
  const unavailablePreferences: IPreference[] = [];

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

  return shifts;
}

function initShifts(): IOrganizedShiftDay[] {
  return [1, 2, 3, 4, 5, 6, 7].map((day: number) => {
    return {
      morning: new Shift(day, "morning"),
      noon: new Shift(day, "noon"),
      evening: new Shift(day, "evening"),
    };
  });
}
