import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {PlaylistTrackScreenParams} from '../../model/model';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store';
import TrackPlayer, {Track} from 'react-native-track-player';

import {colors} from '../../asset/color/color';

import {Header} from '../../component/common/Header';
import {removeMusicFromPlaylist} from '../../store/slices/storageSlice';

const PlaylistDetailScreen = () => {
  const dispatch = useDispatch();
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

  const handleAddMusicToPlaylist = () => {};

  const handleRemoveMusicFromPlaylist = (musciId: string) => {
    Alert.alert('트랙 삭제', '이 트랙을 플레이리스트에서 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          dispatch(removeMusicFromPlaylist({playlistId, musciId}));
        },
      },
    ]);
  };

  const handlePlayPlaylist = () => {};

  const renderPlaylistMusicItem = ({item}: {item: Track}) => (
    <View style={styles.playlistContainer}>
      <TouchableOpacity
        style={styles.playlistWrapper}
        onPress={handlePlayPlaylist}>
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
});

export default PlaylistDetailScreen;
