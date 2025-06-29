import TrackPlayer, {State, Track} from 'react-native-track-player';
import {store} from '../store';
import {
  setIsPlaying,
  setSearchTrackQueue,
  setcurrentSearchTrackIndex,
  setPlaylistTrackQueue,
  setCureentPlaylistTrackIndex,
} from '../store/slices/playMusicSlice';
import {getValidAudioUrl} from '../utils/validateAudioUrl';
import {savePlayLog} from '../network/network';

/**
 * 음악 재생을 시작하는 서비스 함수 (백엔드와 통신한 오디오 파일을 통해 track을 play하는 서비스 함수)
 * @param item
 */
export async function playMusicService(item: Track): Promise<void> {
  const videoId = item.id;

  if (!videoId) {
    throw new Error('No videoId found for this item.');
  }

  try {
    TrackPlayer.pause();
    const currentState = store.getState();

    const audioUrl = await getValidAudioUrl(item);

    const itemWithAudioUrl: Track = {
      id: item.id,
      url: audioUrl,
      title: item.title || item.snippet.title,
      artist: item.artist || item.snippet.channelTitle,
      artwork: item.artwork || item.snippet.thumbnails.medium.url,
    };

    // TrackPlayer 큐에서 해당 곡이 있는지 확인
    const trackQueue = await TrackPlayer.getQueue();
    const hasTrackIndex = trackQueue.findIndex(track => track.id === item.id);

    const existingTrack = trackQueue[hasTrackIndex];
    // TrackPlayer의 해당 트랙에 url이 없거나 빈 값이면 갱신
    if (!existingTrack.url || existingTrack.url === '') {
      const newQueue = [...trackQueue];
      newQueue[hasTrackIndex] = itemWithAudioUrl;
      await TrackPlayer.remove(hasTrackIndex);
      await TrackPlayer.add(itemWithAudioUrl, hasTrackIndex);
    }
    // TrackPlayer 큐에 있으면 해당 인덱스로 이동
    await TrackPlayer.skip(hasTrackIndex);
    await TrackPlayer.play();
    store.dispatch(setIsPlaying(true));
    await savePlayLog(itemWithAudioUrl);

    // Redux 큐 갱신 추가
    const finalQueue = await TrackPlayer.getQueue();
    const finalCurrentTrackIndex = await TrackPlayer.getActiveTrackIndex();

    if (currentState.playMusic.activeSource === 'normal') {
      store.dispatch(setSearchTrackQueue(finalQueue));
      store.dispatch(
        setcurrentSearchTrackIndex(
          finalCurrentTrackIndex !== undefined ? finalCurrentTrackIndex : null,
        ),
      );
    } else {
      store.dispatch(setPlaylistTrackQueue(finalQueue));
      store.dispatch(
        setCureentPlaylistTrackIndex(
          finalCurrentTrackIndex !== undefined ? finalCurrentTrackIndex : null,
        ),
      );
    }
  } catch (err: unknown) {
    console.error('Error in playbackService (startPlayback):', err);
    if (err instanceof Error) {
      throw new Error('Failed to start playback: ' + err.message);
    } else {
      throw new Error('Unknown error in playbackService.');
    }
  }
}
