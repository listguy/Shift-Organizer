import React, { useCallback } from "react";
import styled from "styled-components";
import Swal, { SweetAlertResult } from "sweetalert2";
import {
  dayInMS,
  IPreference,
  IShiftManager,
  IStudent,
  shiftInMS,
  weekInMs,
} from "../shift_organizer_modules/utils/interface";
import { FaTrashAlt } from "react-icons/fa";
import { RiCloseLine, RiCheckFill } from "react-icons/ri";

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
  rmvPref,
  rmvStudent,
}: {
  students: IStudent[];
  addPref: (
    studentName: string,
    shiftTimeStamp: number,
    available?: boolean,
    sm?: IShiftManager
  ) => boolean | Error;
  rmvPref: (studentName: string, shiftTimeStamp: number) => boolean | Error;
  rmvStudent: (studentName: string) => boolean | Error;
}) {
  const promptAddModal = useCallback(async (studentName: string) => {
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
  }, []);

  const promptRmvModal = useCallback(
    async (pref: IPreference, student: IStudent) => {
      Swal.fire({
        title: "Are you sure?",
        text: `Delete prefrence ${pref.getTimeString()} for ${student.name}?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        confirmButtonColor: "#d33",
        confirmButtonText: "Delete",
      }).then((result: SweetAlertResult) => {
        if (result.isConfirmed) {
          const succeed: boolean | Error = rmvPref(
            student.name,
            pref.shiftTimeStamp
          );
          if (succeed === true) {
            Swal.fire("Deleted!", "", "success");
          } else {
            console.log(succeed);
            Swal.fire("oops...", "", "error");
          }
        }
      });
    },
    []
  );

  const promptRmvStudentModal = useCallback(async (studentName: string) => {
    Swal.fire({
      title: `Delete student ${studentName}?`,
      text: `This is irreversiable!`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        const succeed: boolean | Error = rmvStudent(studentName);
        if (succeed === true) {
          Swal.fire("OK", `Student ${studentName} deleted`, "success");
        } else {
          if (succeed instanceof Error) {
            console.log(succeed);
            Swal.fire("oops...", succeed.message, "error");
          }
        }
      }
    });
  }, []);

  return (
    <Wrapper data-flick>
      {students.length > 0 ? (
        students.map((student: IStudent) => (
          <Ticket key={`student-${student.name}`} className="caroucell">
            <Header>
              <h3>{student.name}</h3>
              <StyledButton
                bgcolor="#5f0101"
                onClick={() => promptRmvStudentModal(student.name)}
              >
                Remove Student
              </StyledButton>
            </Header>
            <PrefList>
              {student.getPreferences().map((pref: IPreference, i: number) => (
                <PrefRow
                  key={`pref-${student.name}-${i}`}
                  available={pref.available}
                >
                  {pref.handled ? (
                    <RiCheckFill style={{ fontSize: "1.5em" }} />
                  ) : (
                    <RiCloseLine style={{ fontSize: "1.5em" }} />
                  )}
                  {pref.getTimeString()}
                  <TrashButton onClick={() => promptRmvModal(pref, student)}>
                    <FaTrashAlt />
                  </TrashButton>
                </PrefRow>
              ))}
            </PrefList>
            {/* @ts-ignore */}
            <StyledButton onClick={() => promptAddModal(student.name)}>
              Add Pref
            </StyledButton>
          </Ticket>
        ))
      ) : (
        <span
          style={{ textAlign: "center", fontSize: "1.5em", margin: "0 auto" }}
        >
          No Students Exist
        </span>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  /* background-color: red; */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 99%;
  height: 28vh;
  min-height: 24vh;
  margin: auto;
  overflow-x: auto;
  ::-webkit-scrollbar {
    height: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: rgba(15, 15, 15, 0.6);
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Ticket = styled.div`
  background-color: rgb(23, 20, 20);
  color: wheat;
  display: flex;
  flex-direction: column;
  margin: 10px 2vw;
  min-width: 20%;
  width: 20%;
  height: 82%;
  padding: 8px 12px;
  border-radius: 5px;
  box-shadow: -3px 4px 8px 2px rgba(240, 250, 252, 0.8);
`;

const Header = styled.div`
  display: grid;
  align-items: flex-end;
  grid-template-columns: 3fr 1.8fr;
  margin-bottom: 10px;
  h3 {
    margin: 3%;
    font-size: 2.2em;
  }
`;
const PrefList = styled.div`
  /* background-color: green; */
  height: 65%;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 2px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
const PrefRow = styled.div`
  background-color: ${(props: { available: boolean }) =>
    props.available ? "#1a641e" : "rgb(126,5,5)"};
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 8fr 1fr;
  margin: 1% 0;
  padding: 1% 2%;
`;
const TrashButton = styled.span`
  color: rgb(238, 34, 56);
  font-size: 1.2em;
  cursor: pointer;
  margin: 0 auto;

  :hover {
  }
`;
const StyledButton = styled.span`
  background-color: ${(props: { bgcolor: string }) =>
    props.bgcolor ? props.bgcolor : "#928619"};
  color: #e0dede;
  width: fit-content;
  height: fit-content;
  padding: 8px 5px;
  border-radius: 10px;
  font-size: 0.9em;
  cursor: pointer;
`;
