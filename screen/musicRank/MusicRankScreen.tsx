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
import {MusicRankItem} from '../../model/model';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../../asset/color/color';

const NewMusicScreen = () => {
  const [musicRank, setMusicRank] = useState<MusicRankItem[]>([]);

  const firstMusic = musicRank[0]; // 1등 음악

  useFocusEffect(
    useCallback(() => {
      const fetchRank = async () => {
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
      };
      fetchRank();
    }, []),
  );

  const handlePressMusic = (item: MusicRankItem) => {};

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
      <Text style={styles.header}>MrPly 탑 100</Text>
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
    marginVertical: 20,
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

export default NewMusicScreen;
