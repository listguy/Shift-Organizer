import WeekTable from "./components/WeekTable";
import { Preference, Student } from "./shift_organizer_modules/utils/Entities";
import {
  IOrganizedShiftDay,
  IPreference,
  IShiftManager,
  IStudent,
} from "./shift_organizer_modules/utils/interface";
import ShiftManager from "./shift_organizer_modules/shiftOrginazor";
import { useEffect, useState } from "react";

const names: string[] = [
  "Nitzan",
  "Nadav",
  "Asaf",
  // "Shimon",
  // "Anna",
  // "Idan",
  // "Danel",
  // "Lahav",
  // "Sean",
  // "Omri",
];
const getRandomDay: () => number = () => Math.floor(Math.random() * 7) + 1;
const getRandomWeek: () => number = () => Math.floor(Math.random() * 0) + 1;
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

const SM = new ShiftManager();
console.log("New SM");
// const shiftMonth: IOrganizedShiftDay[][] = SM.organize(students);
// console.log(shiftMonth);
function App() {
  const [students, setStudents] = useState<IStudent[]>(SM.students);
  const [shiftsState, setShiftState] = useState<IOrganizedShiftDay[][]>(
    SM.shifts
  );

  // Adds a new student to the shift Manager
  const addStudent: (name: string, sm?: IShiftManager) => IStudent | void = (
    name: string,
    sm: IShiftManager = SM
  ) => {
    try {
      const newStudent: IStudent = sm.addStudent(name)!;
      setStudents((prev: IStudent[]) => prev.concat([newStudent]));
      return newStudent;
    } catch (e) {
      alert("Student with this name already exists!");
    }
  };

  useEffect(() => {
    //@ts-ignore
    addStudent("Nitzan");
  }, []);

  return (
    <>
      <button onClick={() => addStudent("Asaf")}>Please do not fuck up</button>
      <h1 style={{ textAlign: "center" }}>This week's shifts</h1>
      <h2>Available Students</h2>
      <div>
        {students.map((student: IStudent) => (
          <li> {student.name}</li>
        ))}
      </div>
      Week 1
      <WeekTable shifts={shiftsState[0]} />
      Week 2
      <WeekTable shifts={shiftsState[1]} />
      Week 3
      <WeekTable shifts={shiftsState[2]} />
      Week 4
      <WeekTable shifts={shiftsState[3]} />
      <h2>Students Preferences</h2>
      {/* {students.map((student: IStudent) => (
        <li>
          <b>{student.name}</b>,{" "}
          {student?.preferences.map(
            (pref: IPreference) =>
              `${pref.shift.day}-${pref.shift.time} ${
                pref.available ? "available" : "unavailable"
              }`
          )}
        </li>
      ))} */}
    </>
  );
}

export default App;
