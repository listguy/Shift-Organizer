import React, { useCallback } from "react";
import Swal from "sweetalert2";
import {
  IShiftManager,
  IStudent,
} from "../shift_organizer_modules/utils/interface";

export default function AddStudent({
  addFunction,
}: {
  addFunction: (name: string, sm?: IShiftManager) => IStudent | boolean;
}) {
  const promptModal = useCallback(async () => {
    const { value: name } = await Swal.fire({
      title: "Enter New Student's Name",
      input: "text",
      showCancelButton: true,
      inputPlaceholder: "Name...",
      inputValidator: (name: string) => {
        if (!name) return "Please enter a valid name";
        return null;
      },
    });

    if (name) {
      const sucess: boolean | IStudent = addFunction(name);
      if (sucess) {
        Swal.fire("Woohoo!", `Student ${name} added!`, "success");
      } else {
        Swal.fire("Oops..", `Student ${name} alredy exists!`, "error");
      }
    }
  }, []);

  return <div onClick={promptModal}>Add Student</div>;
}
