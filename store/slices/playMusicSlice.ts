import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MusicPlayerState} from '../../model/model';
import TrackPlayer, {Track} from 'react-native-track-player';

const initialState: MusicPlayerState = {
  currentMusic: null,
  isPlaying: false,
  isPlayingMusicBarVisible: false,
  musicTrackQueue: [],
  currentMusicIndex: null,
  currentPlaybackPosition: 0,
};

const playMusicSlice = createSlice({
  name: 'playMusic',
  initialState,
  reducers: {
    setCurrentMusic: (state, action: PayloadAction<Track | null>) => {
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
    setCurrentPlaybackPosition: (state, action: PayloadAction<number>) => {
      state.currentPlaybackPosition = action.payload;
    },
  },
});

export const {
  setCurrentMusic,
  setIsPlaying,
  setIsPlayingMusicBarVisible,
  setMusicTrackQueue,
  setCurrentMusicIndex,
  setCurrentPlaybackPosition,
} = playMusicSlice.actions;
export default playMusicSlice.reducer;
