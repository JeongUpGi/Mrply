import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MusicPlayerState} from '../../model/model';
import TrackPlayer, {Track} from 'react-native-track-player';

const initialState: MusicPlayerState = {
  currentMusic: null,
  isPlaying: false,
  isPlayingMusicBarVisible: false,

  // 검색 결과 관련 상태
  searchTrackQueue: [],
  currentSearchTrackIndex: null,

  // 플레이리스트 관련 상태
  playlistTrackQueue: [],
  currentPlaylistTrackIndex: null,
  currentPlaylistId: null,

  // 현재 활성화된 소스
  activeSource: 'normal',

  currentPlaybackPosition: 0,

  isPlayMusicServiceLoading: false,
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

    // 검색 결과 관련 액션들
    setSearchTrackQueue: (state, action: PayloadAction<Track[]>) => {
      state.searchTrackQueue = action.payload;
    },
    setcurrentSearchTrackIndex: (
      state,
      action: PayloadAction<number | null>,
    ) => {
      state.currentSearchTrackIndex = action.payload;
    },

    // 플레이리스트 관련 액션들
    setPlaylistTrackQueue: (state, action: PayloadAction<Track[]>) => {
      state.playlistTrackQueue = action.payload;
    },
    setCureentPlaylistTrackIndex: (
      state,
      action: PayloadAction<number | null>,
    ) => {
      state.currentPlaylistTrackIndex = action.payload;
    },
    setCurrentPlaylistId: (state, action: PayloadAction<string | null>) => {
      state.currentPlaylistId = action.payload;
    },

    // 활성 소스 변경
    setActiveSource: (state, action: PayloadAction<'normal' | 'playlist'>) => {
      state.activeSource = action.payload;
    },

    setCurrentPlaybackPosition: (state, action: PayloadAction<number>) => {
      state.currentPlaybackPosition = action.payload;
    },
    setIsPlayMusicServiceLoading: (state, action: PayloadAction<boolean>) => {
      state.isPlayMusicServiceLoading = action.payload;
    },
  },
});

export const {
  setCurrentMusic,
  setIsPlaying,
  setIsPlayingMusicBarVisible,
  setSearchTrackQueue,
  setcurrentSearchTrackIndex,
  setPlaylistTrackQueue,
  setCureentPlaylistTrackIndex,
  setCurrentPlaylistId,
  setActiveSource,
  setCurrentPlaybackPosition,
  setIsPlayMusicServiceLoading,
} = playMusicSlice.actions;
export default playMusicSlice.reducer;
