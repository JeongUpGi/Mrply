import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MusicPlayerState} from '../../model/model';
import TrackPlayer, {Track} from 'react-native-track-player';

const initialState: MusicPlayerState = {
  currentMusic: null,
  isPlaying: false,
  isPlayingMusicBarVisible: false,
  musicTrackQueue: [],
  currentMusicIndex: null,
};

const playMusicSlice = createSlice({
  name: 'playMusic',
  initialState,
  reducers: {
    setCurrentMusic: (state, action: PayloadAction<Track>) => {
      state.currentMusic = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setIsPlayingMusicBarVisible: (state, action: PayloadAction<boolean>) => {
      state.isPlayingMusicBarVisible = action.payload;
    },
    setMusicTrackQueue: (state, action: PayloadAction<Track[]>) => {
      state.musicTrackQueue = action.payload;
    },
    setCurrentMusicIndex: (state, action: PayloadAction<number | null>) => {
      state.currentMusicIndex = action.payload;
    },
  },
});

export const {
  setCurrentMusic,
  setIsPlaying,
  setIsPlayingMusicBarVisible,
  setMusicTrackQueue,
  setCurrentMusicIndex,
} = playMusicSlice.actions;
export default playMusicSlice.reducer;
