import React, {useState, useEffect} from 'react';
import {Provider, useSelector, useDispatch} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState} from './store';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet, AppState} from 'react-native';
import RootStackNavigator from './navigator/Routes';
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
  State,
} from 'react-native-track-player';
import PlayingMusicBar from './component/common/PlayingMusicBar';
import {
  setCurrentMusic,
  setIsPlaying,
  setCurrentPlaybackPosition,
  setSearchTrackQueue,
  setcurrentSearchTrackIndex,
  setPlaylistTrackQueue,
  setCureentPlaylistTrackIndex,
} from './store/slices/playMusicSlice';
import {colors} from './asset/color/color';

// 앱 최초 업로드 시 TrackPlayer 초기 설정
async function setupPlayer() {
  let isSetup = false;
  try {
    await TrackPlayer.setupPlayer();
    isSetup = true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('Already have a player instance')) {
        isSetup = true;
      } else {
        console.error('Failed to setup player', error.message);
      }
    } else {
      console.error(
        'Failed to setup player with unexpected error type:',
        error,
      );
    }
  } finally {
    return isSetup;
  }
}

// Provider 마운트 후 redux상태를 가져오기 위해 따로 구분해서 렌더링
function AppContent(): React.JSX.Element {
  const [isPlayerSetupDone, setIsPlayerSetupDone] = useState(false);
  const dispatch = useDispatch();

  const currentMusic = useSelector(
    (state: RootState) => state.playMusic.currentMusic,
  );
  const isPlaying = useSelector(
    (state: RootState) => state.playMusic.isPlaying,
  );
  const searchTrackQueue = useSelector(
    (state: RootState) => state.playMusic.searchTrackQueue,
  );
  const currentSearchTrackIndex = useSelector(
    (state: RootState) => state.playMusic.currentSearchTrackIndex,
  );
  const playlistTrackQueue = useSelector(
    (state: RootState) => state.playMusic.playlistTrackQueue,
  );
  const playlistCurrentIndex = useSelector(
    (state: RootState) => state.playMusic.currentPlaylistTrackIndex,
  );
  const activeSource = useSelector(
    (state: RootState) => state.playMusic.activeSource,
  );
  const isPlayingMusicBarVisible = useSelector(
    (state: RootState) => state.playMusic.isPlayingMusicBarVisible,
  );
  const currentPlaybackPosition = useSelector(
    (state: RootState) => state.playMusic.currentPlaybackPosition,
  );

  // 현재 소스(검색 or 플레이리스트)에 따른 큐와 인덱스 선택
  const currentQueue =
    activeSource === 'search' ? searchTrackQueue : playlistTrackQueue;
  const currentIndex =
    activeSource === 'search' ? currentSearchTrackIndex : playlistCurrentIndex;

  // 플레이어 셋업 함수
  useEffect(() => {
    const initPlayer = async () => {
      try {
        const setupDone = await setupPlayer();
        setIsPlayerSetupDone(setupDone);
      } catch (error) {
        console.error('Player initialization error:', error);
        setIsPlayerSetupDone(true);
      }
    };

    initPlayer();
  }, []);

  useEffect(() => {
    if (!isPlayerSetupDone) return;

    if (currentQueue && currentQueue.length > 0 && currentIndex !== null) {
      const syncTrackPlayerWithPersistedState = async () => {
        try {
          await TrackPlayer.reset();
          await TrackPlayer.add(currentQueue);
          await TrackPlayer.skip(currentIndex);
          await TrackPlayer.seekTo(currentPlaybackPosition);

          if (isPlaying) {
            await TrackPlayer.play();
          }
        } catch (e) {
          console.error('TrackPlayer sync error:', e);
          dispatch(setIsPlaying(false));
          dispatch(setCurrentMusic(null));
          if (activeSource === 'search') {
            dispatch(setSearchTrackQueue([]));
            dispatch(setcurrentSearchTrackIndex(null));
          } else {
            dispatch(setPlaylistTrackQueue([]));
            dispatch(setCureentPlaylistTrackIndex(null));
          }
          dispatch(setCurrentPlaybackPosition(0));
        }
      };
      syncTrackPlayerWithPersistedState();
    }
  }, []);

  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackState],
    async event => {
      if (event.type === Event.PlaybackTrackChanged) {
        const newIndex = await TrackPlayer.getActiveTrackIndex();
        const newTrack = await TrackPlayer.getActiveTrack();
        const currentQueue = await TrackPlayer.getQueue();

        // 현재 활성 소스(검색 or 플레이리스트) 에 따라 보여지는 재생목록 업데이트
        if (activeSource === 'search') {
          dispatch(setSearchTrackQueue(currentQueue));
          dispatch(
            setcurrentSearchTrackIndex(
              newIndex !== undefined ? newIndex : null,
            ),
          );
        } else {
          dispatch(setPlaylistTrackQueue(currentQueue));
          dispatch(
            setCureentPlaylistTrackIndex(
              newIndex !== undefined ? newIndex : null,
            ),
          );
        }

        if (newTrack) {
          dispatch(setCurrentMusic(newTrack));
        }
      } else if (event.type === Event.PlaybackState) {
        // 현재 재생중인 곡 상태 변경 시 (일시 정지 등)
        if (event.state === State.Playing || event.state === State.Buffering) {
          //음악 재생, 버퍼링
          dispatch(setIsPlaying(true));
        } else if (
          //음악 정지
          event.state === State.Paused ||
          event.state === State.Stopped
        ) {
          dispatch(setIsPlaying(false));
          // 백그라운드로 이동 시 일시정지 처리되기에 마지막 포지션 redux에 저장
          const currentPlayPosition = await TrackPlayer.getPosition();
          dispatch(setCurrentPlaybackPosition(currentPlayPosition));
        } else if (
          //음악 마지막 끝
          event.state === State.Ended
        ) {
          //처음부터 반복 재생
          await TrackPlayer.skip(0);
          await TrackPlayer.play();
        }
      }
    },
  );

  if (!isPlayerSetupDone) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.green_1DB954} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStackNavigator />
        {currentMusic && isPlayingMusicBarVisible && (
          <View style={styles.playingMusicBarContainer}>
            <PlayingMusicBar />
          </View>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  playingMusicBarContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
