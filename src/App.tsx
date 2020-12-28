import WeekTable from "./components/WeekTable";
import { Preference, Student } from "./shift_organizer_modules/utils/Entities";
import {
  dayInMS,
  IOrganizedShiftDay,
  IPreference,
  IShiftManager,
  IStudent,
  shiftInMS,
  weekInMs,
} from "./shift_organizer_modules/utils/interface";
import ShiftManager from "./shift_organizer_modules/shiftOrginazor";
import { useEffect, useState } from "react";
import AddStudent from "./components/AddStudent";
import Swal, { SweetAlertResult } from "sweetalert2";
import StudentsDeatails from "./components/StudentTicket";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import styled from "styled-components";
import "./App.css";
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
const getRandomWeek: () => number = () => Math.floor(Math.random() * 0) + 1;
const getShift: () => number = () => [0, 1, 2][Math.floor(Math.random() * 3)];
const getAvailable: () => boolean = () =>
  Boolean(Math.floor(Math.random() * 2));

const SM = new ShiftManager();

// const students: IStudent[] =
names.map((name: string) => {
  const newStudent: IStudent = SM.addStudent(name)!;
  const pref: IPreference = new Preference(
    newStudent,
    getRandomWeek() * weekInMs +
      getRandomDay() * dayInMS +
      getShift() * shiftInMS,
    getAvailable()
  );
  newStudent.addPreference(pref);
});

function App() {
  const [students, setStudents] = useState<IStudent[]>(SM.getAllStudents());
  const [shiftsState, setShiftState] = useState<IOrganizedShiftDay[][]>(
    SM.getAllShifts()
  );
  const [displayedWeek, setDisplayedWeek] = useState<number>(0);

  // Adds a new student to the shift Manager
  const addStudent: (name: string, sm?: IShiftManager) => IStudent | boolean = (
    name: string,
    sm: IShiftManager = SM
  ) => {
    try {
      const newStudent: IStudent = sm.addStudent(name)!;
      setStudents(sm.getAllStudents());
      return newStudent;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const removeStudent: (name: string, sm?: IShiftManager) => boolean | Error = (
    name: string,
    sm: IShiftManager = SM
  ) => {
    try {
      sm.removeStudent(name);
      setStudents(sm.getAllStudents());
      return true;
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const addPreferenceToStudent: (
    studentName: string,
    shiftTimeStamp: number,
    available?: boolean,
    sm?: IShiftManager
  ) => boolean | Error = (
    studentName: string,
    shiftTimeStamp: number,
    available: boolean = true,
    sm: IShiftManager = SM
  ) => {
    try {
      sm.addPreferenceToStudent(studentName, available, shiftTimeStamp);
      setStudents(sm.getAllStudents());
      return true;
    } catch (e) {
      return e;
    }
  };

  const removePreferenceFromStudent: (
    studentName: string,
    shiftTimeStamp: number,
    sm?: IShiftManager
  ) => boolean | Error = (
    studentName: string,
    shiftTimeStamp: number,
    sm: IShiftManager = SM
  ) => {
    try {
      sm.removePreferenceFromStudent(studentName, shiftTimeStamp);
      setStudents(sm.getAllStudents());
      return true;
    } catch (e) {
      return e;
    }
  };

  const organizeShifts: () => void = () => {
    if (students.length < 7) {
      Swal.fire({
        title: "Hey!",
        text: `Only ${students.length} ${
          students.length > 1 ? "students are" : "student is"
        } saved in the system. Procceed?`,
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "No",
      }).then((result: SweetAlertResult) => {
        if (result.isConfirmed) {
          SM.organize();
          setShiftState(SM.getAllShifts());
        }
      });
    } else {
      SM.organize();
      setShiftState(SM.getAllShifts());
    }
  };

  const handleLeft: () => void = () =>
    setDisplayedWeek((prev: number) => clamp(3, 0, prev - 1));

  const handleRight: () => void = () =>
    setDisplayedWeek((prev: number) => clamp(3, 0, prev + 1));

  console.log(students);
  return (
    <>
      <AddStudent addFunction={addStudent} />
      <button onClick={organizeShifts}>Organize!</button>
      <h1 style={{ textAlign: "center" }}>Shift Organizer</h1>

      <StudentsDeatails
        students={students}
        addPref={addPreferenceToStudent}
        rmvPref={removePreferenceFromStudent}
        rmvStudent={removeStudent}
      />
      <ButtonsRow>
        <ArrowButton opdir={false} onClick={handleLeft}>
          <FaCaretLeft />
        </ArrowButton>
        <span>Week {displayedWeek + 1}</span>
        <ArrowButton opdir={true} onClick={handleRight}>
          <FaCaretRight />
        </ArrowButton>
      </ButtonsRow>
      <WeekTable shifts={shiftsState[displayedWeek]} />
    </>
  );
}

export default App;

//helpers
function clamp(max: number, min: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4vh;
  span {
    font-size: 2em;
    height: 100%;
  }
`;

const ArrowButton = styled.div`
  font-size: 3em;
  margin: 0 2vw;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  :hover {
    transform: translate(
      ${(props: { opdir: boolean }) => (props.opdir ? "5px" : "-5px")},
      0
    );
  }
`;
