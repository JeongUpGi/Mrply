import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {PlaylistTrackScreenParams} from '../../model/model';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, store} from '../../store';
import TrackPlayer, {Track} from 'react-native-track-player';

import {colors} from '../../asset/color/color';

import {Header} from '../../component/common/Header';
import {
  addMusicToPlaylist,
  removeMusicFromPlaylist,
} from '../../store/slices/storageSlice';
import SearchMusicModal from '../../component/modal/SearchMusicModal';
import {playAllMusicService} from '../../service/musicService';
import {
  setActiveSource,
  setCureentPlaylistTrackIndex,
  setCurrentMusic,
  setCurrentPlaylistId,
  setIsPlaying,
  setIsPlayingMusicBarVisible,
  setPlaylistTrackQueue,
} from '../../store/slices/playMusicSlice';
import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../../model/model';
import {getAudioUrlAndData, savePlayLog} from '../../network/network';

const PlaylistDetailScreen = () => {
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<{params: PlaylistTrackScreenParams}, 'params'>>();

  const {playlistId} = route.params as {playlistId: string};

  const currentPlaylistTrack = useSelector((state: RootState) =>
    state.storage.storedPlaylists.find(p => p.id === playlistId),
  );

  if (!currentPlaylistTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>플레이리스트를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const handleAddMusicToPlaylist = () => {
    setIsSearchModalVisible(true);
  };

  const handleRemoveMusicFromPlaylist = (musicId: string) => {
    Alert.alert('트랙 삭제', '이 트랙을 플레이리스트에서 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeMusicFromPlaylist({playlistId, musicId}));

          const updatedPlaylist = store
            .getState()
            .storage.storedPlaylists.find(p => p.id === playlistId);
          const updatedTracks = updatedPlaylist ? updatedPlaylist.tracks : [];

          const currentMusic = store.getState().playMusic.currentMusic;
          if (currentMusic && currentMusic.id === musicId) {
            if (updatedTracks.length > 0) {
              // 남은 곡이 있으면 맨 앞 곡으로 재생 이동
              const firstTrack = updatedTracks[0];
              await TrackPlayer.reset();
              await TrackPlayer.add(updatedTracks);
              await TrackPlayer.skip(0);
              await TrackPlayer.play();

              dispatch(setCurrentMusic(firstTrack));
              dispatch(setIsPlaying(true));
              dispatch(setPlaylistTrackQueue(updatedTracks));
              dispatch(setCureentPlaylistTrackIndex(0));
            } else {
              // 남은 곡이 없으면 재생 멈춤 및 상태 초기화
              await TrackPlayer.reset();
              dispatch(setCurrentMusic(null));
              dispatch(setIsPlaying(false));
              dispatch(setPlaylistTrackQueue([]));
              dispatch(setCureentPlaylistTrackIndex(null));
            }
          } else {
            // 재생 중인 곡이 삭제된 곡이 아니면, 큐만 갱신
            dispatch(setPlaylistTrackQueue(updatedTracks));
          }
        },
      },
    ]);
  };

  const handlePlayPlaylist = async (track: Track) => {
    try {
      setIsLoading(true);
      // 플레이리스트의 모든 트랙을 Redux에 설정
      dispatch(setPlaylistTrackQueue(currentPlaylistTrack.tracks));

      const selectedTrackIndex = currentPlaylistTrack.tracks.findIndex(
        item => item.id === track.id,
      );
      dispatch(setCureentPlaylistTrackIndex(selectedTrackIndex));

      dispatch(setActiveSource('playlist'));
      dispatch(setCurrentPlaylistId(playlistId));
      dispatch(setIsPlayingMusicBarVisible(true));

      await TrackPlayer.reset();
      await TrackPlayer.add(currentPlaylistTrack.tracks);
      await TrackPlayer.skip(selectedTrackIndex); //여기서는 지정해야 app.tsx에서 newTrack을 제대로 인식

      navigation.navigate('playingMusicScreen');

      // 음악 재생 로그 저장
      const saveLogRes = await savePlayLog(track);
      if (!saveLogRes) {
        Alert.alert(
          '재생 기록 저장 실패',
          '음악 재생 로그 저장에 실패했습니다.',
        );
      }

      // 재생 화면으로 이동
      navigation.navigate('playingMusicScreen');
    } catch (error: any) {
      console.error('플레이리스트 재생 오류:', error);
      Alert.alert(
        '재생 오류',
        error.message || '음악 재생 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = async (track: Track) => {
    try {
      setIsLoading(true);
      let trackWithUrl = track;
      if (!track.url) {
        const {audioPlaybackData} = await getAudioUrlAndData(track);
        trackWithUrl = {...track, url: audioPlaybackData.url};
      }

      await dispatch(
        addMusicToPlaylist({
          playlistId: route.params.playlistId,
          track: trackWithUrl,
        }),
      );
      Alert.alert('알림', '플레이리스트에 추가되었습니다.');
      // setIsSearchModalVisible(false);
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.message || '플레이리스트에 곡을 추가하는 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlaylistMusicItem = ({item}: {item: Track}) => (
    <View style={styles.playlistContainer}>
      <TouchableOpacity
        style={styles.playlistWrapper}
        onPress={() => handlePlayPlaylist(item)}>
        <Image style={styles.musicThumbnail} source={{uri: item.artwork}} />
        <View style={styles.musicInfoWrapper}>
          <Text style={styles.musicTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.musicArtist}>{item.artist}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deletePlaylistIconWrapper}
        onPress={() => handleRemoveMusicFromPlaylist(item.id)}>
        <Image
          source={require('../../asset/images/delete.png')}
          style={styles.deletePlaylistIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header.leftTitleRightIcon
        title={currentPlaylistTrack.title}
        titleStyle={styles.title}
      />
      <SearchMusicModal
        visible={isSearchModalVisible}
        holderText="아티스트, 노래"
        isParentLoading={isLoading}
        onClose={() => setIsSearchModalVisible(false)}
        onTrackSelect={handleTrackSelect}
      />
      <FlatList
        data={currentPlaylistTrack.tracks}
        renderItem={renderPlaylistMusicItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>플레이리스트가 비어있습니다</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddMusicToPlaylist}>
            <Image
              source={require('../../asset/images/plus_green.png')}
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonText}>음악 추가하기</Text>
          </TouchableOpacity>
        }
      />
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
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.black,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  playlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_dcdcdc,
    paddingVertical: 12,
  },
  playlistWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicInfoWrapper: {
    flex: 1,
  },
  deletePlaylistIconWrapper: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePlaylistIcon: {
    width: 30,
    height: 30,
  },
  musicThumbnail: {
    width: 95,
    height: 70,
    marginRight: 10,
  },
  musicTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  musicArtist: {
    color: colors.gray_a9a9a9,
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green_1DB954,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.white,
    marginRight: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, // 최소 높이 설정
  },
  emptyText: {
    color: colors.gray_808080,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20, // 상단 여백
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlaylistDetailScreen;
