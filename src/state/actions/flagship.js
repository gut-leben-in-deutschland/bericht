export const SET_LOCATION = 'FLAGSHIP_SET_LOCATION';
export const setLocation = (location) => ({
  type: SET_LOCATION,
  location
});

export const SET_NUM_ADULTS = 'SET_NUM_ADULTS';
export const setNumAdults = (numAdults) => ({
  type: SET_NUM_ADULTS,
  numAdults
});

export const SET_NUM_CHILDREN = 'SET_NUM_CHILDREN';
export const setNumChildren = (numChildren) => ({
  type: SET_NUM_CHILDREN,
  numChildren
});

export const SET_ANNUAL_INCOME = 'SET_ANNUAL_INCOME';
export const setAnnualIncome = (annualIncome) => ({
  type: SET_ANNUAL_INCOME,
  annualIncome
});

export const SET_LEISURE_TIME = 'SET_LEISURE_TIME';
export const setLeisureTime = (leisureTime) => ({
  type: SET_LEISURE_TIME,
  leisureTime
});

export const SET_DESIRED_WORKING_HOURS = 'SET_DESIRED_WORKING_HOURS';
export const setDesiredWorkingHours = (desiredWorkingHours) => ({
  type: SET_DESIRED_WORKING_HOURS,
  desiredWorkingHours
});

export const SET_ACTUAL_WORKING_HOURS = 'SET_ACTUAL_WORKING_HOURS';
export const setActualWorkingHours = (actualWorkingHours) => ({
  type: SET_ACTUAL_WORKING_HOURS,
  actualWorkingHours
});
