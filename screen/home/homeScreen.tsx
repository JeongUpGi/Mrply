import React, {useCallback, useState} from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {getMusicRank} from '../../network/network';
import {useDispatch} from 'react-redux';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {MusicRankItem, RootStackParamList} from '../../model/model';

import {colors} from '../../asset/color/color';
import {convertMusicRankItemToTrack} from '../../utils/formatHelpers';
import {
  setActiveSource,
  setcurrentSearchTrackIndex,
  setIsPlayingMusicBarVisible,
  setSearchTrackQueue,
} from '../../store/slices/playMusicSlice';
import {playAllMusicService} from '../../service/musicService';
import {Header} from '../../component/common/Header';
import {Track} from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';

const HomeScreen = () => {
  const [musicRank, setMusicRank] = useState<MusicRankItem[]>([]);

  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const firstMusic = musicRank[0]; // 1등 음악

  const fetchRank = useCallback(async () => {
    try {
      const resData = await getMusicRank();
      setMusicRank(resData);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('순위 조회 실패', err.message);
      } else {
        Alert.alert('순위 조회 실패', '네트워크 오류');
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRank();
    }, [fetchRank]),
  );

  // 개별 음악 실행 함수
  const handlePressMusic = async (item: MusicRankItem) => {
    const track = convertMusicRankItemToTrack(item);
    try {
      dispatch(setIsPlayingMusicBarVisible(true));
      dispatch(setActiveSource('normal'));

      // 기존 큐 확인
      const currentQueue = await TrackPlayer.getQueue();
      const existingTrackIndex = currentQueue.findIndex(t => t.id === track.id);

      if (existingTrackIndex !== -1) {
        await TrackPlayer.skip(existingTrackIndex);
        dispatch(setcurrentSearchTrackIndex(existingTrackIndex));
      } else {
        await TrackPlayer.add([track]);
        const newQueue = await TrackPlayer.getQueue();
        const newTrackIndex = newQueue.findIndex(t => t.id === track.id);
        await TrackPlayer.skip(newTrackIndex);
        dispatch(setcurrentSearchTrackIndex(newTrackIndex));
        dispatch(setSearchTrackQueue(newQueue));
      }
    } catch (err: any) {
      console.error('음악 재생 오류:', err);
      Alert.alert('음악 재생 오류', err.message);
    }
  };

  const handlePressAllPlayMusic = async () => {
    try {
      const tracks: Track[] = musicRank.map(item => ({
        id: item.video_id,
        title: item.title,
        artist: item.artist,
        artwork: item.thumbnail_url,
        url: '',
      }));

      dispatch(setSearchTrackQueue(tracks));
      dispatch(setcurrentSearchTrackIndex(0));
      dispatch(setActiveSource('normal'));

      await playAllMusicService(tracks[0], null);

      navigation.navigate('playingMusicScreen');
    } catch (err: any) {
      console.error('음악 재생 오류:', err);
      Alert.alert('음악 재생 오류', err.message);
    }
  };

  const renderRankItem = ({
    item,
    index,
  }: {
    item: MusicRankItem;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() => handlePressMusic(item)}
      style={styles.rankItemContainer}>
      <Image style={styles.thumbnailSmall} source={{uri: item.thumbnail_url}} />
      <View style={styles.rankItemSubContainer}>
        <View style={{width: '8%'}}>
          <Text style={styles.rankItemText}>{index + 2}. </Text>
        </View>
        <View style={{width: '92%'}}>
          <Text style={styles.musicTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.musicArtist}>{item.artist}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header.leftTitleRightComponentHeader
        title="MrPly 탑 100"
        titleStyle={styles.header}
        headerBackgroundColor={{backgroundColor: colors.gray_f5f5f5}}
        centerComponent={
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={handlePressAllPlayMusic}>
            <Image
              style={styles.allPlayImage}
              source={require('../../asset/images/all_play_green.png')}
            />
            <Text style={styles.allPlayText}>전체재생</Text>
          </TouchableOpacity>
        }
      />
      {firstMusic && (
        <TouchableOpacity
          onPress={() => handlePressMusic(firstMusic)}
          style={styles.firstMusicContainer}
          activeOpacity={0.8}>
          <Image
            style={styles.thumbnailLarge}
            source={{uri: firstMusic.thumbnail_url}}
          />
          <Text style={styles.firstMusicRankText}>1위</Text>
          <Text style={styles.firstMusicTitle} numberOfLines={2}>
            {firstMusic.title}
          </Text>
          <Text style={styles.firstMusicArtist}>{firstMusic.artist}</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={musicRank.slice(1)}
        keyExtractor={item => item.id?.toString() || item.video_id}
        renderItem={renderRankItem}
        contentContainerStyle={styles.rankList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.black_1c1c1c,
  },
  allPlayImage: {
    width: 27,
    height: 27,
    marginRight: 5,
  },
  allPlayText: {
    fontSize: 18,
    color: colors.green_1DB954,
  },
  firstMusicContainer: {
    alignItems: 'center',
    marginBottom: 10,
    padding: 16,
    backgroundColor: colors.gray_f5f5f5,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  thumbnailLarge: {
    width: 180,
    height: 115,
    borderRadius: 12,
    marginBottom: 12,
  },
  firstMusicRankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.green_1DB954,
    marginBottom: 4,
  },
  firstMusicTitle: {
    fontSize: 17,
    fontWeight: 'semibold',
    color: colors.black_1c1c1c,
    marginBottom: 2,
    textAlign: 'center',
  },
  firstMusicArtist: {
    fontSize: 16,
    color: colors.gray_808080,
    marginBottom: 2,
    textAlign: 'center',
  },
  rankList: {
    paddingHorizontal: 16,
  },
  rankItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: colors.gray_d3d3d3,
    borderBottomWidth: 1,
  },
  rankItemSubContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  rankItemText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.green_1DB954,
  },
  thumbnailSmall: {
    width: 72,
    height: 55,
    borderRadius: 6,
    marginRight: 12,
  },
  musicTitle: {
    fontSize: 16,
    fontFamily: 'semibold',
    color: colors.gray_333333,
  },
  musicArtist: {
    fontSize: 14,
    color: colors.gray_808080,
  },
});

export default HomeScreen;
