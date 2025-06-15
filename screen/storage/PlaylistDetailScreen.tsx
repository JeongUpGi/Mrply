import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {PlaylistTrackScreenParams} from '../../model/model';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import TrackPlayer, {Track} from 'react-native-track-player';

import {colors} from '../../asset/color/color';

import {Header} from '../../component/common/Header';

const PlaylistDetailScreen = () => {
  const route =
    useRoute<RouteProp<{params: PlaylistTrackScreenParams}, 'params'>>();

  const currentPlaylistTrack = useSelector((state: RootState) =>
    state.storage.storedPlaylists.find(p => p.id === route.params.playlistId),
  );

  if (!currentPlaylistTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>플레이리스트를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const handleAddMusicToPlaylist = () => {};

  const handlePlayPlaylist = () => {};

  const renderPlaylistTrackItem = ({item}: {item: Track}) => (
    console.log('item', item),
    (
      <TouchableOpacity style={styles.trackItem} onPress={handlePlayPlaylist}>
        <Image style={styles.trackThumbnail} source={{uri: item.artwork}} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>
        <Text style={styles.trackDuration}>{item.duration}</Text>
      </TouchableOpacity>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header.leftTitleRightIcon
        title={currentPlaylistTrack.title}
        titleStyle={styles.title}
      />
      <FlatList<Track>
        data={currentPlaylistTrack.tracks}
        renderItem={renderPlaylistTrackItem}
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
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_dcdcdc,
  },
  trackInfo: {
    flex: 1,
  },
  trackThumbnail: {
    width: 95,
    height: 70,
    marginRight: 10,
  },
  trackTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackArtist: {
    color: colors.gray_a9a9a9,
    fontSize: 14,
  },
  trackDuration: {
    color: colors.black,
    fontSize: 14,
    marginLeft: 16,
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
