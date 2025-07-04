import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, store} from '../../store';
import {colors} from '../../asset/color/color';
import {Header} from '../../component/common/Header';
import TextInputModal from '../../component/modal/TextInputModal';
import {addPlaylist, removePlaylist} from '../../store/slices/playlistSlice';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../model/model';
import {formatDate} from '../../utils/formatHelpers';
import TrackPlayer from 'react-native-track-player';
import {
  setCurrentMusic,
  setCurrentPlaylistId,
  setIsPlaying,
  setIsPlayingMusicBarVisible,
  setPlaylistTrackQueue,
} from '../../store/slices/playMusicSlice';
import {usePlayingMusicBarHeight} from '../../contexts/PlayingMusicBarHeightContext';

const PlaylistScreen = () => {
  const {musicBarHeight} = usePlayingMusicBarHeight();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const storedPlaylists = useSelector(
    (state: RootState) => state.playlist.storedPlaylists,
  );

  const dispatch = useDispatch();

  const handlePressPlaylist = (playlistId: string) => {
    navigation.navigate('playlistDetailScreen', {playlistId});
  };

  const handleCreatePlaylist = async () => {
    dispatch(addPlaylist(playlistTitle));
    setPlaylistTitle('');
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    Alert.alert('플레이리스트 삭제', '이 플레이리스트를 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const state = store.getState();
          const {currentPlaylistId, activeSource} = state.playMusic;
          if (activeSource === 'playlist' && currentPlaylistId === playlistId) {
            await TrackPlayer.reset();
            dispatch(setCurrentMusic(null));
            dispatch(setIsPlaying(false));
            dispatch(setIsPlayingMusicBarVisible(false));
            dispatch(setCurrentPlaylistId(null));
            dispatch(setPlaylistTrackQueue([]));
          }

          dispatch(removePlaylist(playlistId));
        },
      },
    ]);
  };

  // 플레이리스트 이미지 같은 경우 첫 번째 곡 썸네일로 대체
  const renderPlaylisItem = ({item}: {item: any}) => {
    const hasTracks = item.tracks && item.tracks.length > 0;
    return (
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() => handlePressPlaylist(item.id)}>
        {hasTracks ? (
          <Image
            source={{uri: item.tracks[0].artwork}}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.noImageContainer]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={styles.trackInfo}>
          <Text style={styles.playlistTitle}>{item.title}</Text>
          <Text style={styles.updatedAt}>
            수정 날짜 : {formatDate(item.updatedAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteImageWrapper}
          onPress={() => handleDeletePlaylist(item.id)}>
          <Image
            source={require('../../asset/images/delete.png')}
            style={styles.deleteImage}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {marginBottom: musicBarHeight}]}>
      <Header.leftTitleRightIcon
        title="플레이리스트"
        titleStyle={styles.title}
        rightIcon={require('../../asset/images/plus_green.png')}
        onPressRight={() => {
          setIsModalVisible(true);
        }}
        rightIconStyle={{
          tintColor: colors.green_1DB954,
          width: 30,
          height: 30,
        }}
      />
      {storedPlaylists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>플레이리스트가 비어있습니다</Text>
        </View>
      ) : (
        <FlatList
          data={storedPlaylists}
          renderItem={renderPlaylisItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.playlistContainer}
        />
      )}
      <TextInputModal
        title="새 플레이리스트"
        visible={isModalVisible}
        inputTitle={playlistTitle}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleCreatePlaylist}
        onChangeTitle={setPlaylistTitle}
      />
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
  playlistContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_d3d3d3,
    // backgroundColor: 'red',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  trackInfo: {
    flex: 1,
    height: 60,
    marginLeft: 10,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  playlistTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  updatedAt: {
    color: colors.gray_a9a9a9,
    fontSize: 12,
    // alignSelf: 'flex-end',
    // marginRight: 10,
  },
  removeButton: {
    padding: 10,
  },
  removeIcon: {
    width: 24,
    height: 24,
    tintColor: colors.gray_c0c0c0,
  },
  noImageContainer: {
    backgroundColor: colors.gray_c0c0c0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray_c0c0c0,
    fontSize: 20,
  },
  deleteImageWrapper: {
    // height: '100%',
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteImage: {
    width: 30,
    height: 30,
  },
});

export default PlaylistScreen;
