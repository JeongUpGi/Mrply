import React, {useState, useRef, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
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
} from 'react-native';

import {SearchResultItem} from '../../model/model';
import {searchVideos} from '../../network/network';
import {colors} from '../../asset/color/color';

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      setSearchResult([]);
      setSearchText('');
      setInputFocused(false);
    }, []),
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

  const handleSearch = async () => {
    if (!searchText) {
      Alert.alert('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchVideos(searchText + ' official music video');
      console.log('data ===>', data);
      if (data && data.items) {
        setSearchResult(data.items);
      } else {
        setError('검색 결과 구조가 예상과 다릅니다.');
        setSearchResult([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem: ListRenderItem<SearchResultItem> = ({item}) => (
    <View style={styles.resultItem}>
      <Image
        style={styles.thumbnail}
        source={{uri: item.snippet.thumbnails.medium.url}}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.snippet.title}</Text>
        <Text style={styles.channelTitle}>{item.snippet.channelTitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Image
            source={require('../../asset/images/search.png')}
            style={{width: 20, height: 20, tintColor: colors.gray_808080}}
          />
          <TextInput
            style={styles.input}
            placeholder="아티스트, 노래, 가사"
            placeholderTextColor={colors.gray_808080}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onSubmitEditing={handleSearch}
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

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>검색 중..</Text>
        </View>
      )}
      {error && <Text style={styles.error}>오류: {error}</Text>}

      {!loading && !inputFocused && (
        <FlatList
          data={searchResult}
          style={styles.musicListContainer}
          keyExtractor={(item, index) =>
            item.id.videoId ||
            item.id.channelId ||
            item.id.playlistId ||
            `fallback-${index}`
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 50,
    marginHorizontal: 30,
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
    marginTop: 50,
  },
  resultItem: {
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
  channelTitle: {
    fontSize: 14,
    color: colors.gray_a9a9a9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    color: 'red',
  },
  error: {
    color: colors.red,
  },
});

export default SearchScreen;
