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
  ActivityIndicator,
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
  setSearchTrackQueue,
  setcurrentSearchTrackIndex,
  setPlaylistTrackQueue,
  setCureentPlaylistTrackIndex,
  setActiveSource,
} from '../../store/slices/playMusicSlice';
import {colors} from '../../asset/color/color';
import {Header} from '../../component/common/Header';
import ActionSheet from 'react-native-actionsheet';
import {RootStackParamList, StoredPlaylist} from '../../model/model';
import ListModal from '../../component/modal/ListModal';
import {addMusicToPlaylist} from '../../store/slices/storageSlice';
import {formatTime} from '../../formatHelpers/formatHelpers';

const PlayingMusicScreen = () => {
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  const currentPlaylistId = useSelector(
    (state: RootState) => state.playMusic.currentPlaylistId,
  );

  // 현재 활성 소스에 따른 큐와 인덱스 선택
  const currentQueue =
    activeSource === 'search' ? searchTrackQueue : playlistTrackQueue;
  const currentIndex =
    activeSource === 'search' ? currentSearchTrackIndex : playlistCurrentIndex;

  useFocusEffect(
    useCallback(() => {
      dispatch(setIsPlayingMusicBarVisible(false));

      return () => {
        dispatch(setIsPlayingMusicBarVisible(true));
      };
    }, [dispatch]),
  );

  // 탭 전환 핸들러 - 해당 큐의 현재 인덱스 음악으로 재생
  const handleTabChange = async (source: 'search' | 'playlist') => {
    try {
      setIsLoading(true);
      dispatch(setActiveSource(source));

      // 해당 소스의 큐와 인덱스 가져오기
      const targetQueue =
        source === 'search' ? searchTrackQueue : playlistTrackQueue;
      const targetIndex =
        source === 'search' ? currentSearchTrackIndex : playlistCurrentIndex;

      // 큐가 있고 인덱스가 유효한 경우에만 재생
      if (
        targetQueue &&
        targetQueue.length > 0 &&
        targetIndex !== null &&
        targetIndex >= 0 &&
        targetIndex < targetQueue.length
      ) {
        // TrackPlayer 큐를 해당 소스의 큐로 교체
        await TrackPlayer.reset();
        await TrackPlayer.add(targetQueue);
        await TrackPlayer.skip(targetIndex);

        // 현재 음악 정보 업데이트
        const targetTrack = targetQueue[targetIndex];
        dispatch(setCurrentMusic(targetTrack));

        // 재생 중이었다면 계속 재생
        if (isPlaying) {
          await TrackPlayer.play();
        }
      } else {
        // 큐가 비어있거나 인덱스가 유효하지 않은 경우
        console.log(`${source} 큐가 비어있거나 인덱스가 유효하지 않습니다.`);
      }
    } catch (error) {
      console.error('탭 전환 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      dispatch(setIsPlaying(false));
    } else {
      await TrackPlayer.play();
      dispatch(setIsPlaying(true));
    }
  };

  const handleNext = async () => {
    if (currentQueue && currentIndex === currentQueue.length - 1) {
      await TrackPlayer.skip(0);
    } else {
      await TrackPlayer.skipToNext();
    }
  };

  const handlePrevious = async () => {
    setIsLoading(true);
    if (currentQueue && currentIndex === 0) {
      await TrackPlayer.skip(currentQueue.length - 1);
    } else {
      await TrackPlayer.skipToPrevious();
    }
    setIsLoading(false);
  };

  const deleteMusicTrackRedux = async (index: number) => {
    await TrackPlayer.remove(index);

    const updatedQueue = [...currentQueue];
    updatedQueue.splice(index, 1);

    if (activeSource === 'search') {
      dispatch(setSearchTrackQueue(updatedQueue));
      if (
        currentSearchTrackIndex !== null &&
        index <= currentSearchTrackIndex
      ) {
        dispatch(setcurrentSearchTrackIndex(currentSearchTrackIndex - 1));
      }
    } else {
      dispatch(setPlaylistTrackQueue(updatedQueue));
      if (playlistCurrentIndex !== null && index <= playlistCurrentIndex) {
        dispatch(setCureentPlaylistTrackIndex(playlistCurrentIndex - 1));
      }
    }
  };

  const handleMusicDelete = async (index: number) => {
    try {
      setIsLoading(true);
      if (index === currentIndex) {
        if (currentQueue && currentQueue.length === 1) {
          await TrackPlayer.reset();
          dispatch(setIsPlaying(false));
          dispatch(setCurrentMusic(null));
          if (activeSource === 'search') {
            dispatch(setSearchTrackQueue([]));
            dispatch(setcurrentSearchTrackIndex(null));
          } else {
            dispatch(setPlaylistTrackQueue([]));
            dispatch(setCureentPlaylistTrackIndex(null));
          }
          navigation.goBack();
        } else {
          if (currentQueue && index === currentQueue.length - 1) {
            await TrackPlayer.skipToPrevious();
            if (activeSource === 'search' && currentSearchTrackIndex !== null) {
              const newIndex = currentSearchTrackIndex - 1;
              dispatch(setcurrentSearchTrackIndex(newIndex));
              if (
                currentQueue &&
                newIndex >= 0 &&
                newIndex < currentQueue.length
              ) {
                dispatch(setCurrentMusic(currentQueue[newIndex]));
              }
            } else if (playlistCurrentIndex !== null) {
              const newIndex = playlistCurrentIndex - 1;
              dispatch(setCureentPlaylistTrackIndex(newIndex));
              if (
                currentQueue &&
                newIndex >= 0 &&
                newIndex < currentQueue.length
              ) {
                dispatch(setCurrentMusic(currentQueue[newIndex]));
              }
            }
          } else {
            await TrackPlayer.skipToPrevious();
            if (activeSource === 'search' && currentSearchTrackIndex !== null) {
              dispatch(setcurrentSearchTrackIndex(currentSearchTrackIndex - 1));
              dispatch(
                setCurrentMusic(currentQueue[currentSearchTrackIndex - 1]),
              );
            } else if (playlistCurrentIndex !== null) {
              dispatch(setCureentPlaylistTrackIndex(playlistCurrentIndex - 1));
              dispatch(setCurrentMusic(currentQueue[playlistCurrentIndex - 1]));
            }
          }
          await deleteMusicTrackRedux(index);
        }
      } else {
        if (activeSource === 'search' && currentSearchTrackIndex !== null) {
          if (currentQueue && index !== currentQueue.length - 1) {
            dispatch(setcurrentSearchTrackIndex(currentSearchTrackIndex - 1));
          }
        } else if (playlistCurrentIndex !== null) {
          if (currentQueue && index !== currentQueue.length - 1) {
            dispatch(setCureentPlaylistTrackIndex(playlistCurrentIndex - 1));
          }
        }
        await deleteMusicTrackRedux(index);
      }
    } catch (error) {
      console.error('삭제 도중 오류 발생', error);
    } finally {
      setIsLoading(false);
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
      await dispatch(addMusicToPlaylist({playlistId, track: currentMusic}));
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
          options:
            activeSource == 'playlist'
              ? ['취소', '플레이리스트 편집']
              : ['취소', '플레이리스트 편집', '플레이리스트에 추가'],
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
        index === currentIndex ? styles.currentPlayingItem : {},
      ]}>
      <TouchableOpacity
        style={styles.queueListItemWrapper}
        onPress={() => handleMusicTrackPress(index)}>
        <Text style={styles.queueListItemIndex}>{index + 1}.</Text>
        <View style={styles.queueListItemInfo}>
          <Text
            style={[
              styles.queueListItemTitle,
              index === currentIndex ? styles.currentPlayingText : {},
            ]}
            numberOfLines={1}>
            {item?.title}
          </Text>
          <Text
            style={[
              styles.queueListItemArtist,
              index === currentIndex ? styles.currentPlayingText : {},
            ]}
            numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </TouchableOpacity>
      {activeSource === 'playlist' ? null : (
        <TouchableOpacity
          style={styles.deleteButtonWrapper}
          onPress={() => handleMusicDelete(index)}>
          <Image
            source={require('../../asset/images/delete.png')}
            style={styles.controlButtonImage}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  // 탭 버튼 컴포넌트
  const TabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeSource === 'search' && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange('search')}>
        <Text
          style={[
            styles.tabButtonText,
            activeSource === 'search' && styles.activeTabButtonText,
          ]}>
          재생목록
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeSource === 'playlist' && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange('playlist')}>
        <Text
          style={[
            styles.tabButtonText,
            activeSource === 'playlist' && styles.activeTabButtonText,
          ]}>
          플레이리스트
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header.leftRightIconCenterComponent
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
        centerComponent={<TabButtons />}
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
          <Text style={styles.queueListTitle}>
            {activeSource === 'search' ? '재생 목록' : '플레이리스트'}
          </Text>
          <FlatList
            data={currentQueue}
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
          options={
            activeSource == 'playlist'
              ? ['취소', '플레이리스트 편집']
              : ['취소', '플레이리스트 편집', '플레이리스트에 추가']
          }
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
              handleShowPlaylistModal();
            }
          }}
        />
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green_1DB954} />
        </View>
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
  // 새로운 탭 스타일 추가
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: colors.gray_333333,
    alignItems: 'center',
    minWidth: 80,
  },
  activeTabButton: {
    backgroundColor: colors.green_1DB954,
  },
  tabButtonText: {
    color: colors.gray_c0c0c0,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayingMusicScreen;
