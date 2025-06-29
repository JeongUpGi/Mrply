import TrackPlayer, {State, Track} from 'react-native-track-player';
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

    if (hasTrackIndex !== -1) {
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
            finalCurrentTrackIndex !== undefined
              ? finalCurrentTrackIndex
              : null,
          ),
        );
      } else {
        store.dispatch(setPlaylistTrackQueue(finalQueue));
        store.dispatch(
          setCureentPlaylistTrackIndex(
            finalCurrentTrackIndex !== undefined
              ? finalCurrentTrackIndex
              : null,
          ),
        );
      }
      return;
    }

    // source에 따른 queue구분 (탭 change와 같은 플레이 루트가 있기에 구분)
    const targetQueue =
      currentState.playMusic.activeSource === 'playlist'
        ? currentState.playMusic.playlistTrackQueue
        : currentState.playMusic.searchTrackQueue;

    const targetIndex = targetQueue.findIndex(
      track => track.id === itemWithAudioUrl.id,
    );

    if (targetIndex !== -1) {
      await TrackPlayer.skip(targetIndex);
    } else {
      // 트랙이 큐에 없다면 큐에 추가하고 추가된 트랙으로
      await TrackPlayer.add([itemWithAudioUrl]);
      const newQueue = await TrackPlayer.getQueue();
      const newTrackIndex = newQueue.findIndex(
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

    store.dispatch(setIsPlaying(true));
    await savePlayLog(itemWithAudioUrl);

    // redux 최신화
    const finalQueue = await TrackPlayer.getQueue();
    const finalCurrentTrackIndex = await TrackPlayer.getActiveTrackIndex();

    // 현재 소스(검색 or 플레이리스트)에 따라 큐 업데이트
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

/**
 * 음악 재생을 시작하는 서비스 함수 (백엔드와 통신한 오디오 파일을 통해 track을 play하는 서비스 함수)
 * @param item
 * @param playlistId
 */
export async function playAllMusicService(
  item: Track,
  playlistId: string | null = null,
): Promise<void> {
  const videoId = item.id;

  if (!videoId) {
    throw new Error('No videoId found for this item.');
  }

  try {
    const currentState = store.getState();
    const source = currentState.playMusic.activeSource;

    // source에 따른 queue구분
    const targetQueue =
      source === 'playlist'
        ? currentState.playMusic.playlistTrackQueue
        : currentState.playMusic.searchTrackQueue;

    const audioUrl = await getValidAudioUrl(item);

    const itemWithAudioUrl: Track = {
      id: item.id,
      url: audioUrl,
      title: item.title || item.snippet?.title,
      artist: item.artist || item.snippet?.channelTitle,
      artwork: item.artwork || item.snippet?.thumbnails?.medium?.url,
    };

    // 전달한 item만 url 채우기
    const updatedQueue = targetQueue.map(track =>
      track.id === itemWithAudioUrl.id
        ? {...track, url: itemWithAudioUrl.url}
        : track,
    );

    await TrackPlayer.reset();
    await TrackPlayer.add(updatedQueue);

    const targetIndex = updatedQueue.findIndex(
      track => track.id === itemWithAudioUrl.id,
    );

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

    store.dispatch(setCurrentMusic(itemWithAudioUrl));
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
          finalCurrentTrackIndex !== undefined ? finalCurrentTrackIndex : 0,
        ),
      );
    } else {
      store.dispatch(setPlaylistTrackQueue(finalQueue));
      store.dispatch(
        setCureentPlaylistTrackIndex(
          finalCurrentTrackIndex !== undefined ? finalCurrentTrackIndex : 0,
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
