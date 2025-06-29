import React, {useCallback, useState, useEffect, useRef} from 'react';
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
  setSearchTrackQueue,
  setPlaylistTrackQueue,
  setActiveSource,
} from '../../store/slices/playMusicSlice';
import {colors} from '../../asset/color/color';
import {Header} from '../../component/common/Header';
import ActionSheet from 'react-native-actionsheet';
import {RootStackParamList, StoredPlaylist} from '../../model/model';
import ListModal from '../../component/modal/ListModal';
import {addMusicToPlaylist} from '../../store/slices/storageSlice';
import {formatTime} from '../../utils/formatHelpers';

const PlayingMusicScreen = () => {
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const progress = useProgress();
  const actionSheetRef = React.useRef<ActionSheet>(null);
  const flatListRef = useRef<FlatList>(null);
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
    activeSource === 'normal' ? searchTrackQueue : playlistTrackQueue;
  const currentIndex =
    activeSource === 'normal' ? currentSearchTrackIndex : playlistCurrentIndex;

  // 현재 재생 중인 곡의 인덱스가 변경될 때마다 자동 스크롤
  const ITEM_HEIGHT = 60; // 큐 아이템의 실제 높이(px)
  useEffect(() => {
    if (
      currentIndex !== null &&
      currentIndex >= 0 &&
      flatListRef.current &&
      currentQueue.length > 0
    ) {
      flatListRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
    }
  }, [currentIndex, currentQueue.length]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setIsPlayingMusicBarVisible(false));
      return () => {
        // 큐가 있고 재생 중인 경우에만 PlayingMusicBar 표시
        if (currentQueue.length > 0 && isPlaying) {
          dispatch(setIsPlayingMusicBarVisible(true));
        }
      };
    }, [dispatch]),
  );

  // 탭 전환 핸들러 - 해당 큐의 현재 인덱스 음악으로 재생
  const handleTabChange = async (source: 'normal' | 'playlist') => {
    try {
      if (
        // 재생중이었던 플레이리스트가 없을 시
        source === 'playlist' &&
        (!currentPlaylistId || !playlists.some(p => p.id === currentPlaylistId))
      ) {
        Alert.alert(
          '알림',
          '재생중인 플레이리스트가 없습니다.\n플레이리스트 화면으로 이동하시겠습니까?',
          [
            {text: '취소', style: 'cancel'},
            {
              text: '이동',
              onPress: () => {
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
              },
            },
          ],
        );
        return;
      }

      dispatch(setActiveSource(source));

      // 해당 소스의 큐와 인덱스 가져오기
      const targetQueue =
        source === 'normal' ? searchTrackQueue : playlistTrackQueue;
      const targetIndex =
        source === 'normal' ? currentSearchTrackIndex : playlistCurrentIndex;

      // 큐가 있고 인덱스가 유효한 경우에만 재생
      if (
        targetQueue &&
        targetQueue.length > 0 &&
        targetIndex !== null &&
        targetIndex >= 0 &&
        targetIndex < targetQueue.length
      ) {
        // TrackPlayer 큐 동기화
        await TrackPlayer.reset();
        await TrackPlayer.add(targetQueue);
        await TrackPlayer.skip(targetIndex);
      } else {
        console.log(`${source} 큐가 비어있거나 인덱스가 유효하지 않습니다.`);
      }
    } catch (error) {
      console.error('탭 전환 중 오류 발생:', error);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      dispatch(setIsPlaying(false));
    } else {
      if (currentMusic) {
        await TrackPlayer.play();
      }
    }
  };

  const handleNext = async () => {
    if (!currentQueue || currentQueue.length === 0 || currentIndex === null)
      return;

    let nextIndex = 0;
    if (currentIndex === currentQueue.length - 1) {
      nextIndex = 0;
    } else {
      nextIndex = currentIndex + 1;
    }
    await TrackPlayer.skip(nextIndex);
  };

  const handlePrevious = async () => {
    if (!currentQueue || currentQueue.length === 0 || currentIndex === null)
      return;

    let prevIndex = 0;
    if (currentIndex === 0) {
      prevIndex = currentQueue.length - 1;
    } else {
      prevIndex = currentIndex - 1;
    }
    await TrackPlayer.skip(prevIndex);
  };

  const handleMusicDelete = async (index: number) => {
    try {
      let nextTrackToPlay: Track | null = null;
      let shouldSkip = false; // trakcPlayer skip 호출 여부 플래그 변수

      // 현재 곡을 삭제하는 경우
      if (index === currentIndex) {
        if (currentQueue && currentQueue.length === 1) {
          // 마지막 곡 삭제
          await TrackPlayer.reset();
          dispatch(setIsPlaying(false));
          dispatch(setIsPlayingMusicBarVisible(false));
          if (activeSource === 'normal') {
            dispatch(setSearchTrackQueue([]));
          } else {
            dispatch(setPlaylistTrackQueue([]));
          }
          navigation.goBack();
          return;
        } else {
          // 삭제 후 재생할 트랙 결정 (이전 곡 또는 첫 곡)
          const prevIndex = index === 0 ? 0 : index - 1;
          nextTrackToPlay = currentQueue[prevIndex];
          shouldSkip = true;
        }
      } else {
        const nextIndex =
          currentIndex! > index ? currentIndex! - 1 : currentIndex!;
        nextTrackToPlay = currentQueue[nextIndex];
        shouldSkip = false;
      }

      // TrackPlayer에서 트랙 삭제
      await TrackPlayer.remove(index);

      // 최신 큐로 Redux 동기화
      const updatedQueue = await TrackPlayer.getQueue();
      if (activeSource === 'normal') {
        dispatch(setSearchTrackQueue(updatedQueue));
      } else {
        dispatch(setPlaylistTrackQueue(updatedQueue));
      }

      // skip이 필요한 경우에만 TrackPlayer.skip() 호출
      if (nextTrackToPlay && shouldSkip) {
        const nextIndex = updatedQueue.findIndex(
          track => track.id === nextTrackToPlay?.id,
        );
        if (nextIndex !== -1) {
          await TrackPlayer.skip(nextIndex);
        }
      }
    } catch (error) {
      console.error('삭제 도중 오류 발생', error);
    }
  };

  const handleMusicTrackPress = async (index: number) => {
    if (!currentQueue || currentQueue.length === 0) return;
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

  const emptyListRenderItem = () => {
    return (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>플레이리스트가 비어있습니다</Text>
      </View>
    );
  };

  const renderMusicTrackQueue: ListRenderItem<Track> = ({item, index}) => (
    <View
      style={[
        styles.queueListItem,
        item.id === currentMusic?.id ? styles.currentPlayingItem : {},
      ]}>
      <TouchableOpacity
        style={styles.queueListItemWrapper}
        onPress={() => handleMusicTrackPress(index)}>
        <Text style={styles.queueListItemIndex}>{index + 1}.</Text>
        <View style={styles.queueListItemInfo}>
          <Text
            style={[
              styles.queueListItemTitle,
              item.id === currentMusic?.id ? styles.currentPlayingText : {},
            ]}
            numberOfLines={1}>
            {item?.title}
          </Text>
          <Text
            style={[
              styles.queueListItemArtist,
              item.id === currentMusic?.id ? styles.currentPlayingText : {},
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
          activeSource === 'normal' && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange('normal')}>
        <Text
          style={[
            styles.tabButtonText,
            activeSource === 'normal' && styles.activeTabButtonText,
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

        <Text style={styles.titleText} numberOfLines={2}>
          {currentMusic?.title}
        </Text>
        <Text style={styles.artistText} numberOfLines={1}>
          {currentMusic?.artist}
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

        <View style={styles.queueListContainer}>
          <Text style={styles.queueListTitle}>
            {activeSource === 'normal' ? '재생 목록' : '플레이리스트'}
          </Text>
          <FlatList
            ref={flatListRef}
            data={currentQueue}
            renderItem={renderMusicTrackQueue}
            keyExtractor={(item, index) => item.id || `track-${index}`}
            showsVerticalScrollIndicator={false}
            style={styles.queueList}
            contentContainerStyle={styles.queueListContent}
            ListEmptyComponent={emptyListRenderItem}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
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
    flexGrow: 1,
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
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  emptyListText: {
    color: colors.gray_c0c0c0,
  },
});

export default PlayingMusicScreen;
