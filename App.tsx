import React, {useState, useEffect} from 'react';
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
  setMusicTrackQueue,
  setCurrentMusicIndex,
  setIsPlaying,
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
  const [isMusicPlayReady, setIsMusicPlayReady] = useState(false);
  const dispatch = useDispatch();

  const currentMusic = useSelector(
    (state: RootState) => state.playMusic.currentMusic,
  );
  const isPlaying = useSelector(
    (state: RootState) => state.playMusic.isPlaying,
  );

  const isPlayingMusicBarVisible = useSelector(
    (state: RootState) => state.playMusic.isPlayingMusicBarVisible,
  );

  useEffect(() => {
    setupPlayer().then(() => {
      setIsMusicPlayReady(true);
    });
  }, []);

  // TrackPlayer 이벤트 리스너 (추후 반복재생, 랜덤셔플 등과 같은 기능 전체적으로 rootContainer에서 정의하기에 필요_ 그래야 편해,,,,)
  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackState],
    async event => {
      if (event.type === Event.PlaybackTrackChanged) {
        // 현재 재생중인 곡 변경 시
        const newIndex = await TrackPlayer.getActiveTrackIndex();
        const newTrack = await TrackPlayer.getActiveTrack();
        const currentQueue = await TrackPlayer.getQueue();

        dispatch(setMusicTrackQueue(currentQueue));
        dispatch(
          setCurrentMusicIndex(newIndex !== undefined ? newIndex : null),
        );
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

  if (!isMusicPlayReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colors.green_1DB954} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStackNavigator />
        {isPlaying && currentMusic && isPlayingMusicBarVisible && (
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
});

export default App;
