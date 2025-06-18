import React, {useState, useRef, useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ListRenderItem,
  Switch,
  ActivityIndicator,
} from 'react-native';

import {RecentSearchItems} from '../../model/model';
import {searchVideos} from '../../network/network';
import {colors} from '../../asset/color/color';
import {
  addRecentSearch,
  deleteRecentSearch,
} from '../../store/slices/recentSearchSlice';
import {RootState} from '../../store';

import {playMusicService} from '../../service/playMusicService';
import {
  setActiveSource,
  setCurrentPlaylistId,
  setIsPlayingMusicBarVisible,
} from '../../store/slices/playMusicSlice';
import TrackPlayer, {Track} from 'react-native-track-player';
import {convertToTrack} from '../../formatHelpers/formatHelpers';

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [totalMusic, setTotalMusic] = useState<Track[]>([]);
  const [officialMusic, setOfficialMusic] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const dispatch = useDispatch();
  const recentSearches = useSelector(
    (state: RootState) => state.recentSearches,
  );
  const currentMusic = useSelector(
    (state: RootState) => state.playMusic.currentMusic,
  );

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleInputCancel = () => {
    setInputFocused(false);
    setSearchText('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleToggleChange = (newValue: boolean) => {
    setIsOfficial(newValue);
  };

  const handleSearch = async (_textItem?: string) => {
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

        const officialTracks = data.items
          .filter(item => item.snippet.title.toLowerCase().includes('official'))
          .map(convertToTrack);
        setOfficialMusic(officialTracks);

        handleInputBlur();
      } else {
        setError('검색 결과 구조가 예상과 다릅니다.');
        setTotalMusic([]);
        setOfficialMusic([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setTotalMusic([]);
      setOfficialMusic([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSearchItem = (_item: string) => {
    dispatch(deleteRecentSearch(_item));
  };

  const startMusic = async (item: Track) => {
    try {
      setLoading(true);
      setError(null);
      dispatch(setActiveSource('search'));
      dispatch(setCurrentPlaylistId(null));
      dispatch(setIsPlayingMusicBarVisible(true));
      await playMusicService(item, 'search', null);
    } catch (err: any) {
      console.error('음악 재생 오류:', err);
      Alert.alert('음악 재생 오류', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMusicItem: ListRenderItem<Track> = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        startMusic(item);
      }}
      style={styles.musicItemList}>
      <Image style={styles.thumbnail} source={{uri: item.artwork}} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  const RenderRecentSearchItems: React.FC<RecentSearchItems> = React.memo(
    ({item, onPress, onDelete}) => {
      return (
        <View style={styles.recentSearchesItemWrapper}>
          <TouchableOpacity
            onPress={() => onPress(item)}
            style={styles.recentSearchTextWrapper}>
            <Text style={styles.recentSearchItemText}>{item}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 5,
            }}
            onPress={() => onDelete(item)}>
            <Image
              source={require('../../asset/images/delete.png')}
              style={{
                width: 25,
                height: 25,
              }}
            />
          </TouchableOpacity>
        </View>
      );
    },
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green_1DB954} />
        </View>
      ) : (
        <View style={{flex: 1, marginHorizontal: 30}}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Image
                source={require('../../asset/images/search.png')}
                style={{width: 20, height: 20, tintColor: colors.gray_808080}}
              />
              <TextInput
                style={styles.input}
                placeholder="아티스트, 노래 검색"
                placeholderTextColor={colors.gray_808080}
                value={searchText}
                onChangeText={setSearchText}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onSubmitEditing={() => handleSearch(searchText)}
                ref={inputRef}
              />
            </View>
            {inputFocused && (
              <TouchableOpacity
                style={styles.cancelButtonTextWrapper}
                onPress={handleInputCancel}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>official만 보기</Text>
            <View style={{width: 5}} />
            <Switch value={isOfficial} onValueChange={handleToggleChange} />
          </View>

          {inputFocused && recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.recentSearchesTitle}>최근 검색어</Text>
              <View>
                {recentSearches.map((item, index) => (
                  <RenderRecentSearchItems
                    key={index}
                    item={item}
                    onPress={handleSearch}
                    onDelete={deleteSearchItem}
                  />
                ))}
              </View>
            </View>
          )}
          {error && <Text style={styles.error}>오류: {error}</Text>}

          {!inputFocused && (
            <FlatList
              data={isOfficial ? officialMusic : totalMusic}
              style={styles.musicListContainer}
              keyExtractor={(item, index) =>
                item.id.videoId ||
                item.id.channelId ||
                item.id.playlistId ||
                `fallback-${index}`
              }
              renderItem={renderMusicItem}
              contentContainerStyle={currentMusic ? {paddingBottom: 60} : null}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 50,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flex: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.gray_dcdcdc,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: colors.gray_dcdcdc,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    marginLeft: 5,
  },
  cancelButtonTextWrapper: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    color: colors.red,
    textAlign: 'center',
  },
  musicListContainer: {
    marginTop: 10,
  },
  musicItemList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  thumbnail: {
    width: 120,
    height: 90,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: colors.gray_a9a9a9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.red,
  },
  toggleText: {
    color: colors.black,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
  recentSearchesContainer: {
    marginTop: 10,
  },
  recentSearchesItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentSearchTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recentSearchItemText: {
    fontSize: 14,
    paddingVertical: 5,
  },
});

export default SearchScreen;
