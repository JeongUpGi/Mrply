import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SearchResultMusicItem, MusicPlayerState} from '../../model/model';

const initialState: MusicPlayerState = {
  currentMusic: null,
  isPlaying: false,
  isPlayingMusicBarVisible: false,
};

const playMusicSlice = createSlice({
  name: 'playMusic',
  initialState,
  reducers: {
    setCurrentMusic: (state, action: PayloadAction<SearchResultMusicItem>) => {
      state.currentMusic = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setIsPlayingMusicBarVisible: (state, action: PayloadAction<boolean>) => {
      state.isPlayingMusicBarVisible = action.payload;
    },
  },
});

export const {setCurrentMusic, setIsPlaying, setIsPlayingMusicBarVisible} =
  playMusicSlice.actions;
export default playMusicSlice.reducer;
