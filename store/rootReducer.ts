import {combineReducers} from '@reduxjs/toolkit';
import recentSearchReducer from './slices/recentSearchSlice';
import playMusicReducer from './slices/playMusicSlice';

const rootReducer = combineReducers({
  recentSearches: recentSearchReducer,
  playMusic: playMusicReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
