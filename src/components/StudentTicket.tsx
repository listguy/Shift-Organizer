import React, { useCallback } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import {
  IPreference,
  IShiftManager,
  IStudent,
} from "../shift_organizer_modules/utils/interface";

export default function StudentsDeatails({
  students,
  addPref,
}: {
  students: IStudent[];
  addPref: (
    studentName: string,
    shiftTimeStamp: number,
    available?: boolean,
    sm?: IShiftManager
  ) => boolean | string;
}) {
  const promptModal = useCallback(async (studentName: string) => {
    const { value: name } = await Swal.fire({
      title: "Enter Preference Details",
      html: '<input id="pref-time" class="swal-input">',
      showCancelButton: true,
    });

    // if (name) {
    //   const sucess: boolean | IStudent = addPref(studentName);
    //   if (sucess) {
    //     Swal.fire("Woohoo!", `Student ${name} added!`, "success");
    //   } else {
    //     Swal.fire("Oops..", `Student ${name} alredy exists!`, "error");
    //   }
    // }
    Swal.fire(studentName);
  }, []);

  return (
    <Wrapper>
      {students.map((student: IStudent) => (
        <Ticket key={`student-${student.name}`}>
          <b>{student.name}</b>
          {student.preferences.map((pref: IPreference, i: number) => (
            <li key={`pref-${student.name}-${i}`}>
              {`${pref.getPrettyTime().week}-${pref.getPrettyTime().day}-${
                pref.getPrettyTime().time
              } ${pref.available ? "available" : "unavailable"}`}
            </li>
          ))}
          <button onClick={() => promptModal(student.name)}>Add Pref</button>
        </Ticket>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  background-color: red;
  grid-template-columns: repeat(5, 1fr);
  width: 80%;
`;

const Ticket = styled.div`
  background-color: yellow;
  margin: 10px;
`;
