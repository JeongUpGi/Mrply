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
    addPlaylist: (state, action: PayloadAction<{playlistTitle: string}>) => {
      const {playlistTitle} = action.payload;
      const newPlaylist: StoredPlaylist = {
        id: `playlist_${Date.now()}`,
        title: playlistTitle,
        tracks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.storedPlaylists.push(newPlaylist);
    },
    //플레이리스트에 곡 추가 액션
    addTrackToPlaylist: (
      state,
      action: PayloadAction<{playlistId: string; track: Track}>,
    ) => {
      const {playlistId, track} = action.payload;
      const playlist = state.storedPlaylists.find(
        item => item.id === playlistId,
      );
      if (playlist) {
        // 중복 체크만 수행
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

export const {addPlaylist, addTrackToPlaylist} = storageSlice.actions;

export default storageSlice.reducer;
