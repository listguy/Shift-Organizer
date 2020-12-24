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
const getRandomDay: () => number = () => Math.floor(Math.random() * 7) + 1;
const getRandomWeek: () => number = () => Math.floor(Math.random() * 4) + 1;
const getShift: () => string = () =>
  ["morning", "noon", "evening"][Math.floor(Math.random() * 3)];
const getAvailable: () => boolean = () =>
  Boolean(Math.floor(Math.random() * 2));

const students: IStudent[] = names.map((name: string) => {
  const newStudent: IStudent = new Student(name);
  const pref: IPreference = new Preference(
    newStudent,
    { day: getRandomDay(), time: getShift(), week: getRandomWeek() },
    getAvailable()
  );
  newStudent.addPreference(pref);
  return newStudent;
});

const sm = new ShiftManager();
const shiftMonth: IOrganizedShiftDay[][] = sm.organize(students);
console.log(shiftMonth);
function App() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>This week's shifts</h1>
      Week 1
      <WeekTable shifts={shiftMonth[0]} />
      Week 2
      <WeekTable shifts={shiftMonth[1]} />
      Week 3
      <WeekTable shifts={shiftMonth[2]} />
      Week 4
      <WeekTable shifts={shiftMonth[3]} />
      <h2>Students Preferences</h2>
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
