import React, {useCallback, useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {useProgress, Track} from 'react-native-track-player';
import {
  setIsPlayingMusicBarVisible,
  setIsPlaying,
  setCurrentMusic,
  setMusicTrackQueue,
  setCurrentMusicIndex,
} from '../../store/slices/playMusicSlice';
import {colors} from '../../asset/color/color';
import {Header} from '../../component/common/Header';
import ActionSheet from 'react-native-actionsheet';
import {RootStackParamList, StoredPlaylist} from '../../model/model';
import ListModal from '../../component/common/ListModal';
import {addTrackToPlaylist} from '../../store/slices/storageSlice';

const PlayingMusicScreen = () => {
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const progress = useProgress();
  const actionSheetRef = React.useRef<ActionSheet>(null);
  const playlists = useSelector(
    (state: RootState) => state.storage.storedPlaylists,
  );

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

  const handleNext = async () => {
    if (currentMusicIndex === musicTrackQueue.length - 1) {
      //마지막 곡일 경우 첫 곡으로 이동
      await TrackPlayer.skip(0);
    } else {
      await TrackPlayer.skipToNext();
    }
  };

  const handlePrevious = async () => {
    if (currentMusicIndex === 0) {
      //첫번째 곡일 경우 마지막 곡으로 이동
      await TrackPlayer.skip(musicTrackQueue.length - 1);
    } else {
      await TrackPlayer.skipToPrevious();
    }
  };

  const deleteMusicTrackRedux = async (index: number) => {
    //해당 곡 제거
    await TrackPlayer.remove(index);

    //Redux상태 업데이터
    const updatedMusicTrackQueue = [...musicTrackQueue];
    updatedMusicTrackQueue.splice(index, 1);
    dispatch(setMusicTrackQueue(updatedMusicTrackQueue));
  };

  const handleMusicDelete = async (index: number) => {
    try {
      if (index === currentMusicIndex) {
        // 현재 재생중인 곡을 삭제하는 경우
        if (musicTrackQueue.length === 1) {
          //곡이 하나일 경우
          await TrackPlayer.reset();
          dispatch(setIsPlaying(false));
          dispatch(setCurrentMusic(null));
          dispatch(setMusicTrackQueue([]));
          dispatch(setCurrentMusicIndex(null));
          navigation.goBack();
        } else {
          // 곡이 여러개일 경우
          if (index === musicTrackQueue.length - 1) {
            //삭제하려는 곡이 마지막일 경우
            await TrackPlayer.skipToNext();
            dispatch(setCurrentMusicIndex(0));
            dispatch(setCurrentMusic(musicTrackQueue[0]));
          } else {
            await TrackPlayer.skipToPrevious();
            if (currentMusicIndex !== null) {
              dispatch(setCurrentMusicIndex(currentMusicIndex - 1));
              dispatch(setCurrentMusic(musicTrackQueue[currentMusicIndex - 1]));
            }
          }
          await deleteMusicTrackRedux(index);
        }
      } else {
        // 현재 재생중인 아닌 곡을 삭제하는 경우
        if (currentMusicIndex !== null) {
          dispatch(setCurrentMusicIndex(currentMusicIndex - 1));
        }
        await deleteMusicTrackRedux(index);
      }
    } catch (error) {
      console.error('삭제 도중 오류 발생', error);
    }
  };

  const handleMusicTrackPress = async (index: number) => {
    await TrackPlayer.skip(index);
  };

  const handleShowPlaylistModal = () => {
    if (playlists.length === 0) {
      Alert.alert(
        '알림',
        '플레이리스트가 없습니다. 플레이리스트를 먼저 생성해주세요.',
      );
      return;
    }
    setIsPlaylistModalVisible(true);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!currentMusic) {
      Alert.alert('알림', '현재 재생 중인 곡이 없습니다.');
      return;
    }

    try {
      await dispatch(addTrackToPlaylist({playlistId, track: currentMusic}));
      setIsPlaylistModalVisible(false);
      Alert.alert('알림', '플레이리스트에 추가되었습니다.');
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '플레이리스트에 곡을 추가하는 중 오류가 발생했습니다.',
      );
    }
  };

  const showActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '플레이리스트 편집', '플레이리스트에 추가'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'mainBottomTabs',
                  state: {
                    routes: [
                      {
                        name: 'storageStack',
                        state: {
                          routes: [{name: 'playlistScreen'}],
                          index: 0,
                        },
                      },
                    ],
                    index: 0,
                  },
                },
              ],
            });
          } else if (buttonIndex === 2) {
            handleShowPlaylistModal();
          }
        },
      );
    } else {
      actionSheetRef.current?.show();
    }
  };

  const renderPlaylistItem = ({item}: {item: StoredPlaylist}) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleAddToPlaylist(item.id)}>
      <Text style={styles.playlistTitle}>{item.title}</Text>
      <Text style={styles.trackCount}>{item.tracks.length}곡</Text>
    </TouchableOpacity>
  );

  const renderMusicTrackQueue: ListRenderItem<Track> = ({item, index}) => (
    <View
      style={[
        styles.queueListItem,
        index === currentMusicIndex ? styles.currentPlayingItem : {},
      ]}>
      <TouchableOpacity
        style={styles.queueListItemWrapper}
        onPress={() => handleMusicTrackPress(index)}>
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
      <TouchableOpacity
        style={styles.deleteButtonWrapper}
        onPress={() => handleMusicDelete(index)}>
        <Image
          source={require('../../asset/images/delete.png')}
          style={styles.controlButtonImage}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header.default
        title={''}
        headerBackgroundColor={{backgroundColor: colors.black_1c1c1c}}
        leftIcon={require('../../asset/images/previous_fill_white.png')}
        onPressLeft={() => navigation.goBack()}
        leftIconStyle={{
          tintColor: colors.white,
          width: 25,
          height: 25,
        }}
        rightIcon={require('../../asset/images/all_menu.png')}
        onPressRight={showActionSheet}
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

      <ListModal
        visible={isPlaylistModalVisible}
        onClose={() => setIsPlaylistModalVisible(false)}
        title="플레이리스트 선택"
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={item => item.id}
      />

      {Platform.OS === 'android' && (
        <ActionSheet
          ref={actionSheetRef}
          title="음악 추가"
          options={['취소', '플레이리스트 편집', '플레이리스트에 추가']}
          cancelButtonIndex={0}
          onPress={index => {
            if (index === 1) {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'mainBottomTabs',
                    state: {
                      routes: [
                        {
                          name: 'storageStack',
                          state: {
                            routes: [{name: 'playlistScreen'}],
                            index: 0,
                          },
                        },
                      ],
                      index: 0,
                    },
                  },
                ],
              });
            } else if (index === 2) {
            }
          }}
        />
      )}
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
  queueListItemWrapper: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonWrapper: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonImage: {
    width: 24,
    height: 24,
    tintColor: colors.white,
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
  cancelButton: {
    backgroundColor: colors.gray_dcdcdc,
  },
  addButton: {
    backgroundColor: colors.green_1DB954,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  playlistItem: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playlistTitle: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 5,
  },
  trackCount: {
    color: colors.gray_808080,
    fontSize: 14,
  },
});

export default PlayingMusicScreen;
