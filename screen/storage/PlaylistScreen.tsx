import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {colors} from '../../asset/color/color';
import {Header} from '../../component/common/Header';
import TextInputModal from '../../component/common/TextInputModal';
import {addPlaylist} from '../../store/slices/storageSlice';

const PlaylistScreen = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const storedPlaylists = useSelector(
    (state: RootState) => state.storage.storedPlaylists,
  );

  const dispatch = useDispatch();

  const handlePressPlaylist = () => {
    console.log('zzz');
  };

  const handleCreatePlaylist = async () => {
    dispatch(addPlaylist(playlistTitle));
    setPlaylistTitle('');
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handlePressPlaylist()}>
      <Image source={{uri: item.artwork}} style={styles.thumbnail} />
      <View style={styles.trackInfo}>
        <Text style={styles.playlistTitle}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          renderItem={renderItem}
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
    padding: 10,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_d3d3d3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  trackInfo: {
    flex: 1,
  },
  playlistTitle: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: colors.gray_c0c0c0,
    fontSize: 14,
    marginTop: 5,
  },
  removeButton: {
    padding: 10,
  },
  removeIcon: {
    width: 24,
    height: 24,
    tintColor: colors.gray_c0c0c0,
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
});

export default PlaylistScreen;
