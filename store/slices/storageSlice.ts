import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {StorageState, StoredPlaylist} from '../../model/model';
import TrackPlayer, {Track} from 'react-native-track-player';

const initialState: StorageState = {
  storedPlaylists: [],
};

const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    //플레이리스트 추가 액션
    addPlaylist: (state, action: PayloadAction<string>) => {
      const playlistTitle = action.payload;
      const newPlaylist: StoredPlaylist = {
        id: `${playlistTitle}_${Date.now()}`,
        title: playlistTitle,
        tracks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.storedPlaylists.push(newPlaylist);
    },
    //플레이리스트 삭제 액션
    removePlaylist: (state, action: PayloadAction<string>) => {
      const playlistId = action.payload;

      // 해당 ID의 플레이리스트 제거
      state.storedPlaylists = state.storedPlaylists.filter(
        playlist => playlist.id !== playlistId,
      );
    },
    //플레이리스트에 곡 추가 액션
    addMusicToPlaylist: (
      state,
      action: PayloadAction<{playlistId: string; track: Track}>,
    ) => {
      const {playlistId, track} = action.payload;
      const playlist = state.storedPlaylists.find(
        item => item.id === playlistId,
      );
      if (playlist) {
        // 중복 체크
        const isAlreadyStored = playlist.tracks.some(
          storedTrack => storedTrack.id === track.id,
        );

        if (!isAlreadyStored) {
          const storedTrack = {
            ...track,
            addedAt: Date.now(),
          };
          playlist.tracks.push(storedTrack);
          playlist.updatedAt = Date.now();
        }
      }
    },
  },
});

export const {addPlaylist, addMusicToPlaylist, removePlaylist} =
  storageSlice.actions;

export default storageSlice.reducer;
