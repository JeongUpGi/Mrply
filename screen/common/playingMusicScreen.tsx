import React, {useCallback} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import {setIsPlayingMusicBarVisible} from '../../store/slices/playMusicSlice';
import {colors} from '../../asset/color/color';
import Header from '../../component/common/Header';

const PlayingMusicScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const progress = useProgress();

  const currentMusic = useSelector(
    (state: RootState) => state.playMusic.currentMusic,
  );
  const isPlaying = useSelector(
    (state: RootState) => state.playMusic.isPlaying,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(setIsPlayingMusicBarVisible(false));

      return () => {
        dispatch(setIsPlayingMusicBarVisible(true));
      };
    }, [dispatch]),
  );

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = async () => {};

  const handleNext = async () => {};

  const handlePrevious = async () => {};

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={''}
        leftIcon={require('../../asset/images/previous_fill_white.png')}
        onPressLeft={() => navigation.goBack()}
        leftIconStyle={{
          tintColor: colors.white,
          width: 25,
          height: 25,
        }}
        rightIcon={require('../../asset/images/all_menu.png')}
        onPressRight={() => {}}
        rightIconStyle={{
          tintColor: colors.white,
          width: 30,
          height: 30,
        }}
      />
      <View style={styles.contentContainer}>
        {currentMusic?.snippet.thumbnails?.high?.url ? (
          <Image
            source={{uri: currentMusic?.snippet.thumbnails.high.url}}
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <Text style={styles.titleText}>{currentMusic?.snippet.title}</Text>
        <Text style={styles.artistText}>
          {currentMusic?.snippet.channelTitle}
        </Text>

        <Slider
          style={styles.progressBarSlider}
          minimumValue={0}
          maximumValue={progress.duration > 0 ? progress.duration : 1}
          value={progress.position || 0}
          onSlidingComplete={async value => {
            await TrackPlayer.seekTo(value);
          }}
          minimumTrackTintColor={colors.green_1DB954}
          maximumTrackTintColor={colors.gray_a9a9a9}
          thumbTintColor={colors.white}
        />
        <View style={styles.timeWrapper}>
          <Text style={styles.time}>{formatTime(progress.position)}</Text>
          <Text style={styles.time}>{formatTime(progress.duration)}</Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.controlButton}>
            <Image
              source={require('../../asset/images/previous_white.png')}
              style={styles.controlButtonImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playPauseButton}>
            <Image
              source={
                isPlaying
                  ? require('../../asset/images/pause.png')
                  : require('../../asset/images/next_fill_white.png')
              }
              style={styles.playPauseStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Image
              source={require('../../asset/images/next_white.png')}
              style={styles.controlButtonImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black_1c1c1c,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 30,
  },
  thumbnailPlaceholder: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 18,
  },
  titleText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistText: {
    color: colors.gray_c0c0c0,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  progressBarSlider: {
    width: '100%',
    height: 40,
  },
  timeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  time: {
    color: colors.gray_c0c0c0,
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 30,
  },
  controlButton: {
    padding: 15,
  },
  controlButtonImage: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  playPauseButton: {
    backgroundColor: colors.green_1DB954,
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseStyle: {
    width: 32,
    height: 32,
    tintColor: colors.white,
  },
  text: {
    color: colors.white,
    fontSize: 18,
  },
});

export default PlayingMusicScreen;
