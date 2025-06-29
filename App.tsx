import React, {useState, useEffect, useRef} from 'react';
import {Provider, useSelector, useDispatch} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState} from './store';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
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
  setIsPlayingMusicBarVisible,
  setIsPlayMusicServiceLoading,
} from './store/slices/playMusicSlice';
import {colors} from './asset/color/color';
import {playMusicService} from './service/musicService';

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

  // 중복 호출 방지를 위한 ref
  const lastProcessedTrackId = useRef<string | null>(null);
  const isProcessingTrack = useRef(false);

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
  const isPlayMusicServiceLoading = useSelector(
    (state: RootState) => state.playMusic.isPlayMusicServiceLoading,
  );
  const currentPlaybackPosition = useSelector(
    (state: RootState) => state.playMusic.currentPlaybackPosition,
  );

  // 현재 소스(검색 or 플레이리스트)에 따른 큐와 인덱스 선택
  const currentQueue =
    activeSource === 'normal' ? searchTrackQueue : playlistTrackQueue;
  const currentIndex =
    activeSource === 'normal' ? currentSearchTrackIndex : playlistCurrentIndex;

  // 플레이어 셋업 함수
  useEffect(() => {
    const initPlayer = async () => {
      try {
        const setupDone = await setupPlayer();
        setIsPlayerSetupDone(setupDone);

        // setupDone이 true면 바로 큐 동기화 실행
        if (
          setupDone &&
          currentQueue &&
          currentQueue.length > 0 &&
          currentIndex !== null
        ) {
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
              if (activeSource === 'normal') {
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
      } catch (error) {
        console.error('Player initialization error:', error);
        setIsPlayerSetupDone(true);
      }
    };

    initPlayer();
  }, []);

  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackState],
    async event => {
      if (event.type === Event.PlaybackTrackChanged) {
        const newTrack = await TrackPlayer.getActiveTrack();

        if (newTrack) {
          // 중복 호출 방지: 같은 트랙이거나 이미 처리 중인 경우 스킵
          if (
            lastProcessedTrackId.current === newTrack.id ||
            isProcessingTrack.current
          ) {
            return;
          }

          // 처리 중 플래그 설정
          isProcessingTrack.current = true;
          lastProcessedTrackId.current = newTrack.id;

          try {
            dispatch(setCurrentMusic(newTrack));
            dispatch(setIsPlayMusicServiceLoading(true));
            await playMusicService(newTrack);
          } catch (error) {
            console.error('playMusicService 호출 중 오류:', error);
          } finally {
            dispatch(setIsPlayMusicServiceLoading(false));
            // 처리 완료 후 플래그 해제
            setTimeout(() => {
              isProcessingTrack.current = false;
            }, 100);
          }
        } else {
          // 현재 트랙이 없으면 뮤직바 숨기기
          dispatch(setCurrentMusic(null));
          dispatch(setIsPlayingMusicBarVisible(false));
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
        {currentMusic &&
          isPlayingMusicBarVisible &&
          !isPlayMusicServiceLoading && (
            <View style={styles.playingMusicBarContainer}>
              <PlayingMusicBar />
            </View>
          )}
        {isPlayMusicServiceLoading && (
          <View style={styles.globalLoadingContainer}>
            <ActivityIndicator size="large" color={colors.green_1DB954} />
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
  globalLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

export default App;
