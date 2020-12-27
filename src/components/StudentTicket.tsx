import React, { useCallback } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import {
  dayInMS,
  IPreference,
  IShiftManager,
  IStudent,
  shiftInMS,
  weekInMs,
} from "../shift_organizer_modules/utils/interface";

const daysInWeek: string[] = [
  "Sunday",
  "Monday",
  "Tuseday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayOptions: string = [0, 1, 2, 3, 4, 5, 6].reduce(
  (prev: string, i: number) =>
    prev + `<option value=${i}>${daysInWeek[i]}</option>`,
  ""
);

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
  ) => boolean | Error;
}) {
  const promptModal = useCallback(async (studentName: string) => {
    const { value: formValue } = await Swal.fire({
      title: "Enter Preference Details",
      html:
        `<br/>` +
        `<em>Week</em> <select id="pref-modal-week">${[0, 1, 2, 3].reduce(
          (prev: string, i: number) =>
            prev + `<option value=${i}>week ${i + 1}</option>`,
          ""
        )}<select>  ` +
        `<em>Day</em> <select id="pref-modal-day">${dayOptions}<select>   ` +
        `<em>Shift</em> <select id="pref-modal-time"><option value=0>morning</option><option value=1>noon</option><option value=2>evening</option><select>` +
        `<br/><br/><input type="checkbox" id="pref-modal-av" class="swal-input">  <em>Available</em></input>`,
      showCancelButton: true,
      preConfirm: () => {
        return [
          //@ts-ignore
          document.getElementById("pref-modal-week")?.value,
          //@ts-ignore
          document.getElementById("pref-modal-day")?.value,
          //@ts-ignore
          document.getElementById("pref-modal-time")?.value,
          //@ts-ignore
          document.getElementById("pref-modal-av")?.checked,
        ];
      },
    });

    if (formValue) {
      const sucess: boolean | Error = addPref(
        studentName,
        weekInMs * parseInt(formValue[0]) +
          dayInMS * parseInt(formValue[1]) +
          shiftInMS * parseInt(formValue[2]),
        formValue[3]
      );
      if (sucess === true) {
        Swal.fire("Woohoo!", `Preference was added!`, "success");
      } else {
        if (sucess instanceof Error)
          Swal.fire("Oops...", sucess.message, "error");
        else Swal.fire("Oops...", "Unknown error occured :( \n Sorry...");
      }
    }
    // Swal.fire(JSON.stringify(formValue));
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
