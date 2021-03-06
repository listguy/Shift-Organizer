import React, { useCallback } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import {
  IOrganizedShiftDay,
  IShift,
  IShiftManager,
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

export default function WeekTable({
  shifts,
  replaceFunc,
}: {
  shifts: IOrganizedShiftDay[];
  replaceFunc: (
    studentName: string,
    shift: IShift,
    sm?: IShiftManager
  ) => boolean | Error;
}) {
  const promptRepModal = useCallback(async (shift: IShift) => {
    const { value: name } = await Swal.fire({
      title: "Enter Student to Assign Name",
      input: "text",
      showCancelButton: true,
      inputPlaceholder: "Name...",
      inputValidator: (name: string) => {
        if (!name) return "Please enter a valid name";
        return null;
      },
    });

    if (name) {
      const sucess: boolean | Error = replaceFunc(name, shift);
      if (sucess) {
        Swal.fire(
          "Woohoo!",
          `Student ${name} was assigned successfuly!`,
          "success"
        );
      } else {
        Swal.fire("Oops..", `can't assign ${name} to this shift :(`, "error");
      }
    }
  }, []);

  return (
    <TableWrapper>
      {shifts?.map((shiftDay: IOrganizedShiftDay, i: number) => (
        <TableColumn>
          <h2>{daysInWeek[i]}</h2>
          <ShiftDay onClick={() => promptRepModal(shiftDay.getMorning())}>
            <span>Morning</span>
            {shiftDay?.getMorning()?.chosen?.name}
          </ShiftDay>
          <ShiftDay onClick={() => promptRepModal(shiftDay.getNoon())}>
            <span>Noon</span>
            {shiftDay?.getNoon()?.chosen?.name}
          </ShiftDay>
          <ShiftDay onClick={() => promptRepModal(shiftDay.getEvening())}>
            <span>Evening</span>
            {shiftDay?.getEvening()?.chosen?.name}
          </ShiftDay>
        </TableColumn>
      ))}{" "}
    </TableWrapper>
  );
}

const TableWrapper = styled.div`
  display: flex;
  width: 90vw;
  min-height: 40vh;
  margin: 0 auto;
`;

const TableColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 14%;
  margin: 0 auto;
  text-align: center;

  h2 {
    font-size: 2em;
    text-shadow: 0px 0px 4px #f7f2f2;
  }
`;

const ShiftDay = styled.div`
  background-color: rgb(149, 7, 38);
  display: flex;
  flex-direction: column;
  height: 30%;
  margin: 3% 2%;
  padding: 4px;
  font-size: 1.5em;
  border-radius: 10px;
  font-style: italic;
  box-shadow: 0px 0px 6px 4px rgba(116, 8, 31, 0.8);

  span {
    font-weight: bold;
    font-style: initial;
    margin-bottom: 4%;
  }
`;
