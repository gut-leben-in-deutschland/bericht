import {Map, fromJS} from 'immutable';
import {SET_NUM_ADULTS, SET_NUM_CHILDREN, SET_LOCATION, SET_ANNUAL_INCOME,
  SET_LEISURE_TIME, SET_DESIRED_WORKING_HOURS,
  SET_ACTUAL_WORKING_HOURS} from 'state/actions/flagship';

const defaultState = Map({
  numAdults: 1,
  numChildren: 0,
  annualIncome: undefined, // Maybe Number
});

export default (state = defaultState, action) => {
  switch (action.type) {
  case SET_NUM_ADULTS:
    return state
      .withMutations(map => {
        let numAdults = Math.max(0, action.numAdults);
        if (numAdults === 0 && state.get('numChildren') === 0) {
          map.set('numChildren', 1);
        }
        map.set('numAdults', numAdults);
      });
  case SET_NUM_CHILDREN:
    return state
      .withMutations(map => {
        let numChildren = Math.max(0, action.numChildren);
        if (numChildren === 0 && state.get('numAdults') === 0) {
          map.set('numAdults', 1);
        }
        map.set('numChildren', numChildren);
      });
  case SET_ANNUAL_INCOME:
    if (action.annualIncome === undefined) {
      return state.delete('annualIncome');
    }
    return state.set('annualIncome', Math.max(0, action.annualIncome));
  case SET_LEISURE_TIME:
    if (action.leisureTime === undefined) {
      return state.delete('leisureTime');
    }
    return state.set('leisureTime', Math.max(0, action.leisureTime));
  case SET_LOCATION:
    if (!action.location) {
      return state.delete('location');
    }
    return state.set('location', fromJS(action.location));
  case SET_DESIRED_WORKING_HOURS:
    if (action.desiredWorkingHours === undefined) {
      return state.delete('desiredWorkingHours');
    }
    return state.set('desiredWorkingHours', Math.max(0, action.desiredWorkingHours));
  case SET_ACTUAL_WORKING_HOURS:
    if (action.actualWorkingHours === undefined) {
      return state.delete('actualWorkingHours');
    }
    return state.set('actualWorkingHours', Math.max(0, action.actualWorkingHours));
  default:
    return state;
  }
};
