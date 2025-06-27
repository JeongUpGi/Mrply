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
import {useDispatch} from 'react-redux';
import {getValidAudioUrl} from '../utils/validateAudioUrl';

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

    if (hasTrackIndex !== -1) {
      await TrackPlayer.skip(hasTrackIndex);
      await TrackPlayer.play();
      store.dispatch(setIsPlaying(true));
      return;
    }

    const currentState = store.getState();
    // 기존 큐 초기화
    // await TrackPlayer.reset();

    // source에 따른 queue구분
    const targetQueue = currentState.playMusic.searchTrackQueue;

    const targetIndex = targetQueue.findIndex(
      track => track.id === itemWithAudioUrl.id,
    );

    if (targetIndex !== -1) {
      await TrackPlayer.skip(targetIndex);
    } else {
      // 2. 트랙이 큐에 없다면 큐에 추가하고 추가된 트랙으로
      await TrackPlayer.add([itemWithAudioUrl]);
      let currentQueue = await TrackPlayer.getQueue();

      const newTrackIndex = currentQueue.findIndex(
        track => track.id === itemWithAudioUrl.id,
      );
      await TrackPlayer.skip(newTrackIndex);
    }

    // 재생
    const playbackState = await TrackPlayer.getPlaybackState();

    if (
      playbackState.state !== State.Playing &&
      playbackState.state !== State.Buffering
    ) {
      await TrackPlayer.play();
    }

    store.dispatch(setCurrentMusic(itemWithAudioUrl));
    store.dispatch(setIsPlaying(true));

    // redux 최신화
    const finalQueue = await TrackPlayer.getQueue();
    const finalCurrentTrackIndex = await TrackPlayer.getActiveTrackIndex();

    // 현재 소스(검색 or 플레이리스트)에 따라 큐 업데이트
    store.dispatch(setSearchTrackQueue(finalQueue));
    store.dispatch(
      setcurrentSearchTrackIndex(
        finalCurrentTrackIndex !== undefined ? finalCurrentTrackIndex : null,
      ),
    );
  } catch (err: unknown) {
    console.error('Error in playbackService (startPlayback):', err);
    if (err instanceof Error) {
      throw new Error('Failed to start playback: ' + err.message);
    } else {
      throw new Error('Unknown error in playbackService.');
    }
  }
}

/**
 * 음악 재생을 시작하는 서비스 함수 (백엔드와 통신한 오디오 파일을 통해 track을 play하는 서비스 함수)
 * @param item
 * @param source 'normal' | 'playlist' - 트랙의 출처
 * @param playlistId
 */
export async function playAllMusicService(
  item: Track,
  source: 'normal' | 'playlist' = 'normal',
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

    console.log('targetQueue ===> ', targetQueue);

    await TrackPlayer.add(targetQueue);

    if (targetIndex !== -1) {
      await TrackPlayer.skip(targetIndex);
    } else {
      await TrackPlayer.skip(0);
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
    if (source === 'normal') {
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
