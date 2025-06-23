import TrackPlayer, {State, Track} from 'react-native-track-player';
import {getAudioUrlAndData} from '../network/network';
import {store} from '../store';
import {
  setCurrentMusic,
  setIsPlaying,
  setSearchTrackQueue,
  setcurrentSearchTrackIndex,
  setPlaylistTrackQueue,
  setCureentPlaylistTrackIndex,
  setActiveSource,
  setCurrentPlaylistId,
} from '../store/slices/playMusicSlice';

/**
 * 음악 재생을 시작하는 서비스 함수 (백엔드와 통신한 오디오 파일을 통해 track을 play하는 서비스 함수)
 * @param item
 * @param source 'search' | 'playlist' - 트랙의 출처
 * @param playlistId
 */
export async function playMusicService(
  item: Track,
  source: 'search' | 'playlist' = 'search',
  playlistId: string | null = null,
): Promise<void> {
  const videoId = item.id;

  if (!videoId) {
    throw new Error('No videoId found for this item.');
  }

  try {
    const {audioPlaybackData} = await getAudioUrlAndData(item);
    const currentState = store.getState();
    // 기존 큐 초기화
    await TrackPlayer.reset();

    // source에 따른 queue구분
    const targetQueue =
      source === 'playlist'
        ? currentState.playMusic.playlistTrackQueue
        : currentState.playMusic.searchTrackQueue;

    const targetIndex = targetQueue.findIndex(
      track => track.id === audioPlaybackData.id,
    );

    await TrackPlayer.add(targetQueue);

    if (source === 'playlist') {
      if (targetIndex !== -1) {
        await TrackPlayer.skip(targetIndex);
      } else {
        await TrackPlayer.skip(0);
      }
    } else {
      if (targetIndex !== -1) {
        await TrackPlayer.skip(targetIndex);
      } else {
        // 2. 트랙이 큐에 없다면 큐에 추가하고 추가된 트랙으로
        await TrackPlayer.add([audioPlaybackData]);
        let currentQueue = await TrackPlayer.getQueue();

        const newTrackIndex = currentQueue.findIndex(
          track => track.id === audioPlaybackData.id,
        );
        await TrackPlayer.skip(newTrackIndex);
      }
    }

    // 재생
    const playbackState = await TrackPlayer.getPlaybackState();

    if (
      playbackState.state !== State.Playing &&
      playbackState.state !== State.Buffering
    ) {
      await TrackPlayer.play();
    }

    store.dispatch(setCurrentMusic(audioPlaybackData));
    store.dispatch(setIsPlaying(true));
    store.dispatch(setActiveSource(source));
    store.dispatch(setCurrentPlaylistId(playlistId));

    // redux 최신화
    const finalQueue = await TrackPlayer.getQueue();
    const finalCurrentTrackIndex = await TrackPlayer.getActiveTrackIndex();

    // 현재 소스(검색 or 플레이리스트)에 따라 큐 업데이트
    if (source === 'search') {
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
