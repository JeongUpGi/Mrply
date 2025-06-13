import {combineReducers} from '@reduxjs/toolkit';
import recentSearchReducer from './slices/recentSearchSlice';
import playMusicReducer from './slices/playMusicSlice';
import storageReducer from './slices/storageSlice';

const rootReducer = combineReducers({
  recentSearches: recentSearchReducer,
  playMusic: playMusicReducer,
  storage: storageReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
