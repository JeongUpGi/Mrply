import {combineReducers} from '@reduxjs/toolkit';
import recentSearchReducer from './slices/recentSearchSlice';

const rootReducer = combineReducers({
  recentSearches: recentSearchReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
