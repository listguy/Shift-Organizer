import React from "react";
import styled from "styled-components";
import { IOrganizedShiftDay } from "../shift_organizer_modules/utils/interface";

export default function WeekTable({
  shifts,
}: {
  shifts: IOrganizedShiftDay[];
}) {
  return (
    <TableWrapper>
      {shifts.map((shiftDay: IOrganizedShiftDay, i: number) => (
        <TableColumn>
          <h2>{i}</h2>
          <ShiftDay>
            <span>
              <b>morning</b>
            </span>
            {shiftDay?.morning?.chosen?.name}
          </ShiftDay>
          <ShiftDay>
            <span>
              <b>noon</b>
            </span>
            {shiftDay?.noon?.chosen?.name}
          </ShiftDay>
          <ShiftDay>
            <span>
              <b>evening</b>
            </span>
            {shiftDay?.evening?.chosen?.name}
          </ShiftDay>
        </TableColumn>
      ))}{" "}
    </TableWrapper>
  );
}

const TableWrapper = styled.div`
  display: flex;
  /* background-color: red; */
  width: 90vw;
  min-height: 40vh;
  margin: 5vh auto;
`;

const TableColumn = styled.div`
  /* background-color: green; */
  display: flex;
  flex-direction: column;
  width: 14%;
  margin: 0 auto;
  text-align: center;
`;

const ShiftDay = styled.div`
  background-color: blue;
  padding: 10px;
  font-size: 1.5em;
  display: flex;
  flex-direction: column;
`;
