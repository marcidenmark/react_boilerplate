import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// State
import * as actions from './actions';
import * as models from './models';
import * as consts from './constants';

// Actions type
export type FooAction = ActionType<typeof actions>;

// Redux Persistor Config
export const persistConfig = {
  key: 'foo',
  whitelist: ['elements'], // Will only persist, whitelisted elements
  storage,
};

// State type
export type FooState = {
  readonly elements: models.Element[];
  readonly title: string;
};

// The initial state
const initialState: FooState = {
  elements: [],
  title: '',
};

// Create a combined reducer and export it
export default persistReducer(
  persistConfig,
  combineReducers<FooState, FooAction>({
    title: (state = initialState.title, action) => {
      switch (action.type) {
        case consts.UPDATE_TITLE:
          return action.payload;
        default:
          return state;
      }
    },
    elements: (state = initialState.elements, action) => {
      switch (action.type) {
        case consts.ADD_ELEMENT:
          return [...state, action.payload];
        case consts.DELETE_LAST:
          if (state.length < 1) return state;
          return state.slice(0, -1);
        default:
          return state;
      }
    },
  }),
);
