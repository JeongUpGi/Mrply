import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native';
import {getMusicRank} from '../../network/network';
import {MusicRankItem} from '../../model/model';
import {createSlice} from '@reduxjs/toolkit';

const NewMusicScreen = () => {
  const [musicRank, setMusicRank] = useState<MusicRankItem[]>([]);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const resData = await getMusicRank();
        console.log('resData ===> ', resData);
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
  }, []);

  const renderRankItem = ({
    item,
    index,
  }: {
    item: MusicRankItem;
    index: number;
  }) => {
    return (
      <View>
        <Image style={styles.thumbnail} source={{uri: item.thumbnail_url}} />
        <Text>
          {index + 1}. {item.title} - {item.artist}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <Text>오늘의 음악 랭킹</Text>
      <FlatList
        data={musicRank}
        keyExtractor={item => item.id?.toString() || item.video_id}
        renderItem={renderRankItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    width: 120,
    height: 90,
    marginRight: 10,
  },
});

export default NewMusicScreen;
