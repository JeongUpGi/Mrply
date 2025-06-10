import React, {useState, useEffect} from 'react';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState} from './store';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import RootStackNavigator from './navigator/Routes';
import TrackPlayer from 'react-native-track-player';
import PlayingMusicBar from './component/common/PlayingMusicBar';

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

// Provider 마운트 후 reudx상태를 가져오기 위해 따로 구분해서 렌더링
function AppContent(): React.JSX.Element {
  const [isMusicPlayReady, setIsMusicPlayReady] = useState(false);

  const currentMusic = useSelector(
    (state: RootState) => state.playMusic.currentMusic,
  );
  const isPlaying = useSelector(
    (state: RootState) => state.playMusic.isPlaying,
  );

  const isPlayingMusicBarVisible = useSelector(
    (state: RootState) => state.playMusic.isPlayingMusicBarVisible, // <-- 이 줄 추가
  );

  useEffect(() => {
    setupPlayer().then(() => {
      setIsMusicPlayReady(true);
    });
  }, []);

  if (!isMusicPlayReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStackNavigator />
        {isPlaying && currentMusic && isPlayingMusicBarVisible && (
          <View style={styles.playingMusicBarContainer}>
            <PlayingMusicBar
              imageUrl={currentMusic.snippet.thumbnails.medium.url}
              musicTitle={currentMusic.snippet.title}
            />
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
  // 추후 동적으로 적용 필요
  playingMusicBarContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default App;
