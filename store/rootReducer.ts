import {combineReducers} from '@reduxjs/toolkit';
import recentSearchReducer from './slices/recentSearchSlice';
import playMusicReducer from './slices/playMusicSlice';
import playlistReducer from './slices/playlistSlice';

const rootReducer = combineReducers({
  recentSearches: recentSearchReducer,
  playMusic: playMusicReducer,
  playlist: playlistReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
