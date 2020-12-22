import WeekTable from "./components/WeekTable";
import { Preference, Student } from "./shift_organizer_modules/utils/Entities";
import {
  IOrganizedShiftDay,
  IPreference,
  IStudent,
} from "./shift_organizer_modules/utils/interface";
import ShiftManager from "./shift_organizer_modules/shiftOrginazor";

const names: string[] = [
  "Nitzan",
  "Nadav",
  "Asaf",
  "Shimon",
  "Anna",
  "Idan",
  "Danel",
  "Lahav",
  "Sean",
  "Omri",
];
const getRandomDay: () => number = () => Math.floor(Math.random() * 7);
const getShift: () => string = () =>
  ["morning", "noon", "evening"][Math.floor(Math.random() * 3)];
const getAvailable: () => boolean = () =>
  Boolean(Math.floor(Math.random() * 2));

const students: IStudent[] = names.map((name: string) => {
  const newStudent: IStudent = new Student(name);
  const pref: IPreference = new Preference(
    newStudent,
    { day: getRandomDay(), time: getShift() },
    getAvailable()
  );
  newStudent.addPreference(pref);
  return newStudent;
});

const sm = new ShiftManager();
const shiftsWeek: IOrganizedShiftDay[] = sm.organize(students);
console.log(shiftsWeek);

function App() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>This week's shifts</h1>
      <WeekTable shifts={shiftsWeek} />;<h2>Students Preferences</h2>
      {students.map((student: IStudent) => (
        <li>
          <b>{student.name}</b>,{" "}
          {student.preferences.map(
            (pref: IPreference) =>
              `${pref.shift.day}-${pref.shift.time} ${
                pref.available ? "available" : "unavailable"
              }`
          )}
        </li>
      ))}
    </>
  );
}

export default App;
