import React, {useCallback} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {useProgress, Track} from 'react-native-track-player';
import {
  setIsPlayingMusicBarVisible,
  setIsPlaying,
} from '../../store/slices/playMusicSlice';
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
  const musicTrackQueue = useSelector(
    (state: RootState) => state.playMusic.musicTrackQueue,
  );
  const currentMusicIndex = useSelector(
    (state: RootState) => state.playMusic.currentMusicIndex,
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

  const handlePlayPause = async () => {
    if (isPlaying) {
      //일시 중지
      await TrackPlayer.pause();
      dispatch(setIsPlaying(false));
    } else {
      //재생
      await TrackPlayer.play();
      dispatch(setIsPlaying(true));
    }
  };

  const handleNext = async () => {};

  const handlePrevious = async () => {};

  const handleTrackPress = async () => {};

  const renderMusicTrackQueue: ListRenderItem<Track> = ({item, index}) => (
    <TouchableOpacity
      style={[
        styles.queueListItem,
        index === currentMusicIndex ? styles.currentPlayingItem : {},
      ]}
      onPress={() => handleTrackPress()}>
      <Text style={styles.queueListItemIndex}>{index + 1}.</Text>
      <View style={styles.queueListItemInfo}>
        <Text
          style={[
            styles.queueListItemTitle,
            index === currentMusicIndex ? styles.currentPlayingText : {},
          ]}
          numberOfLines={1}>
          {item?.title}
        </Text>
        <Text
          style={[
            styles.queueListItemArtist,
            index === currentMusicIndex ? styles.currentPlayingText : {},
          ]}
          numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        {currentMusic?.artwork ? (
          <Image
            source={{uri: currentMusic?.artwork}}
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <Text style={styles.titleText}>{currentMusic?.title}</Text>
        <Text style={styles.artistText}>{currentMusic?.artist}</Text>

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

        <View style={styles.queueListContainer}>
          <Text style={styles.queueListTitle}>재생 목록</Text>
          <FlatList
            data={musicTrackQueue}
            renderItem={renderMusicTrackQueue}
            keyExtractor={(item, index) => item.id || `track-${index}`}
            showsVerticalScrollIndicator={false}
            style={styles.queueList}
            contentContainerStyle={styles.queueListContent}
          />
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
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  thumbnailPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.gray_808080,
    fontSize: 18,
  },
  titleText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistText: {
    color: colors.gray_c0c0c0,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 10,
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
    marginBottom: 20,
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
  queueListContainer: {
    flex: 1,
    width: '100%',
  },
  queueListTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    paddingHorizontal: 5,
  },
  queueList: {
    flex: 1,
    width: '100%',
  },
  queueListContent: {
    paddingBottom: 20,
  },
  queueListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray_808080,
  },
  queueListItemIndex: {
    color: colors.gray_a9a9a9,
    fontSize: 16,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  queueListItemInfo: {
    flex: 1,
  },
  queueListItemTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueListItemArtist: {
    color: colors.gray_c0c0c0,
    fontSize: 14,
    marginTop: 2,
  },
  currentPlayingItem: {
    backgroundColor: colors.green_ffffff1a,
    borderRadius: 5,
  },
  currentPlayingText: {
    color: colors.green_1DB954,
  },
});

export default PlayingMusicScreen;
