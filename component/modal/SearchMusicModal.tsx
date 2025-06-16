import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import {colors} from '../../asset/color/color';
import {Header} from '../common/Header';
import TrackPlayer, {Track} from 'react-native-track-player';
import {SearchMusicModalProps, SearchResultMusicItem} from '../../model/model';
import {useDispatch} from 'react-redux';
import {addRecentSearch} from '../../store/slices/recentSearchSlice';
import {searchVideos} from '../../network/network';
import {convertToTrack} from '../../\bformatHelpers/formatHelpers';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const SearchMusicModal: React.FC<SearchMusicModalProps> = ({
  visible,
  holderText,
  onClose,
  onTrackSelect,
}) => {
  const [searchText, setSearchText] = useState('');
  const [totalMusic, setTotalMusic] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  const handleSearch = async (_textItem: string) => {
    if (!_textItem) {
      Alert.alert('검색어를 입력해주세요.');
      return;
    }
    setSearchText(_textItem);
    dispatch(addRecentSearch(_textItem));
    setLoading(true);
    setError(null);

    try {
      const data = await searchVideos(_textItem + ' official music video');
      if (data && data.items) {
        const tracks = data.items.map(convertToTrack);
        setTotalMusic(tracks);
      } else {
        setError('검색 결과 구조가 예상과 다릅니다.');
        setTotalMusic([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setTotalMusic([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTrackItem: ListRenderItem<Track> = ({item}) => (
    console.log('item ====> ', item),
    (
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() => onTrackSelect(item)}>
        <Image source={{uri: item.artwork}} style={styles.thumbnail} />
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.artist}>{item.artist}</Text>
        </View>
      </TouchableOpacity>
    )
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true} // 이 속성 추가
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Header.leftTitleRightIcon
            title="음악 추가하기"
            rightIcon={require('../../asset/images/cancel.png')}
            onPressRight={onClose}
            rightIconStyle={{
              tintColor: colors.black,
              width: 25,
              height: 25,
            }}
            titleStyle={{color: colors.black}}
          />
          {error && <Text style={styles.error}>오류: {error}</Text>}
          <View style={styles.content}>
            <TextInput
              style={styles.searchInput}
              placeholder={holderText}
              placeholderTextColor={colors.gray_808080}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => handleSearch(searchText)}
            />
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.green_1DB954} />
              </View>
            ) : (
              <FlatList
                data={totalMusic}
                renderItem={renderTrackItem}
                keyExtractor={(item, index) =>
                  item.id.videoId ||
                  item.id.channelId ||
                  item.id.playlistId ||
                  `fallback-${index}`
                }
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    height: 40,
    margin: 10,
    padding: 10,
    backgroundColor: colors.gray_f5f5f5,
    borderRadius: 5,
    color: colors.black,
  },
  listContainer: {
    paddingBottom: 20,
  },
  trackItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_dcdcdc,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  trackInfo: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: colors.gray_808080,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.red,
  },
});

export default SearchMusicModal;
