import WeekTable from "./components/WeekTable";
import { Preference, Student } from "./shift_organizer_modules/utils/Entities";
import {
  dayInMS,
  IOrganizedShiftDay,
  IPreference,
  IShift,
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
import { IoCalendarOutline } from "react-icons/io5";
import { IoIosWarning } from "react-icons/io";
import styled from "styled-components";
import "./App.css";
const names: string[] = [
  "Nitzan",
  "Nadav",
  "Asaf",
  "Shimon",
  "Anna",
  "Lahav",
  "Idan",
  // "Danel",
  // "Sean",
  // "Omri",
];

const mockPreferences: any = [
  { week: 0, day: 0, shift: 0, available: true },
  { week: 0, day: 0, shift: 0, available: true },
  { week: 0, day: 3, shift: 1, available: false },
  { week: 0, day: 6, shift: 2, available: false },
  { week: 0, day: 2, shift: 0, available: true },
  { week: 0, day: 4, shift: 2, available: false },
  { week: 0, day: 5, shift: 1, available: false },
];
const getRandomDay: () => number = () => Math.floor(Math.random() * 7) + 1;
const getRandomWeek: () => number = () => Math.floor(Math.random() * 0) + 1;
const getShift: () => number = () => Math.floor(Math.random() * 3);
const getAvailable: () => boolean = () =>
  Boolean(Math.floor(Math.random() * 2));

const SM = new ShiftManager();

names.forEach((name: string, i: number) => {
  const newStudent: IStudent = SM.addStudent(name)!;
  const mockPref: any = mockPreferences[i];
  const pref: IPreference = new Preference(
    newStudent,
    mockPref.week * weekInMs +
      mockPref.day * dayInMS +
      mockPref.shift * shiftInMS,
    mockPref.available
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

  const replaceStudent: (
    studentName: string,
    shift: IShift,
    sm?: IShiftManager
  ) => boolean | Error = (
    studentName: string,
    shift: IShift,
    sm: IShiftManager = SM
  ) => {
    const studentToAssign: IStudent | undefined = sm.getStudent(studentName);
    if (!studentToAssign) return false;

    sm.assignStudentToShift(studentToAssign, shift);

    setStudents(sm.getAllStudents());
    return true;
  };

  const organizeShifts: () => void = () => {
    if (students.length < 1) {
      Swal.fire(
        "Sorry",
        "You need to have at least one student to organize shifts",
        "info"
      );
      return;
    }
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

  const warnings: string[] = SM.getWarnings();

  return (
    <>
      <WarningMsgContainer>
        {warnings.map((msg: string) => (
          <WarningMessage>
            <IoIosWarning style={{ margin: "0 10px", fontSize: "1.2em" }} />
            {msg}
          </WarningMessage>
        ))}
      </WarningMsgContainer>
      <MainTitle>
        Shift Organizer <IoCalendarOutline style={{ marginLeft: "1vw" }} />
      </MainTitle>
      <MainButtonsRow>
        <AddStudent addFunction={addStudent} />
        <div onClick={organizeShifts}>Organize!</div>
      </MainButtonsRow>
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
      <WeekTable
        shifts={shiftsState[displayedWeek]}
        replaceFunc={replaceStudent}
      />
    </>
  );
}

export default App;

//helpers
function clamp(max: number, min: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}
const MainTitle = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.8em;
  margin-bottom: 3vh;
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2vh;
  span {
    font-size: 2em;
    height: 100%;
  }
`;

const MainButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5vh;
  div {
    background-color: wheat;
    color: rgb(149, 7, 38);
    font-weight: bold;
    padding: 14px 8px;
    width: fit-content;
    font-size: 1.1em;
    border-radius: 15px;
    margin: 0 1vw;
    cursor: pointer;
    transition: 0.1s ease-in-out;
  }

  div:hover {
    transform: translate(0px, -5px);
    box-shadow: 0px 0px 4px 4px rgba(236, 234, 197, 0.8);
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

const WarningMsgContainer = styled.div`
  position: absolute;
  width: 100vw;
  top: 0;
  z-index: 2;
`;
const WarningMessage = styled.div`
  background-color: rgba(238, 106, 18, 0.65);
  color: #3d0101;
  width: 8vw;
  height: 2vh;
  margin: 0.5vh;
  padding: 6px 5px;
  border-radius: 5px;
  font-size: 0.9em;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  transition: 0.2s ease-in-out;

  :hover {
    width: fit-content;
  }
`;
