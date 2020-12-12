class ShiftsDay {
  constructor(title, serial) {
    this.title = title; //sunday, monday etc..
    this.serial = serial; //1 for sunday, 2 for monday
    this.morning = "NA"; //name of the student assigned to morning shift
    this.noon = "NA"; //name of the student assigned to noon shift
    this.evening = "NA"; //name of the student assigned to evening shift
  }

  getShifts() {
    return [this.morning, this.noon, this.evening];
  }

  setShift(time, name) {
    if (!["morning", "noon", "evening"].includes(time)) return;
    this[time] = name;
  }
}

class ShiftPreference {
  constructor(name, day, shift, availablity) {
    this.name = name; //student name
    this.day = day; //day in the week
    this.shift = shift; //shift (morning,noon,evening)
    this.availablity = availablity; //positive numbers represent availability and negative unavailabilty
  }
}

class Shift {
  constructor(day, time) {
    this.day = day; //day of shift
    this.time = time; //time of shift
    this.unavilableStudents = []; //array of names of students who are unavailable for this shift
  }
}

const days = [];
const OrganizeShifts = (preferences) => {
  const schedule = [
    new ShiftsDay("sunday", 1),
    new ShiftsDay("monday", 2),
    new ShiftsDay("tuseday", 3),
    new ShiftsDay("wednesday", 4),
    new ShiftsDay("thursday", 5),
    new ShiftsDay("friday", 6),
    new ShiftsDay("saturday", 7),
  ];

  //first assign and filter all positive availability preferances
  const negativePreferences = preferences.filter((preference) => {
    //if preference is positive (student is available)
    //  //check if shift is open. if open assign student, else continue
  });

  //then 'inform' all shfits which students are not available for them.
  //also remove all negative preferences whose shift is already taken

  //then assign all negative availability preferences to 'legal' shifts (remove negative availability when done)

  //then just fill the rest

  //check if preferences is empty, if not adjust
};
let sunday = new ShiftsDay("sunday", 1);
console.log(sunday);
sunday.setShift("noon", "nitzan");
console.log(sunday);
