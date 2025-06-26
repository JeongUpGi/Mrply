import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {getRandomMusic, getAudioUrlAndData} from '../../network/network';
import TrackPlayer, {Track} from 'react-native-track-player';
import {colors} from '../../asset/color/color';
import {getRoundFormatTitle} from '../../formatHelpers/formatHelpers';
import {useDispatch} from 'react-redux';
import {playMusicService} from '../../service/musicService';

const MusicWorldCupScreen = () => {
  const [musicList, setMusicList] = useState<any[]>([]);
  const [roundTracks, setRoundTracks] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [stage, setStage] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRandomMusic = async () => {
      setIsLoading(true);
      try {
        const data = await getRandomMusic(16);
        setMusicList(data);
        setRoundTracks(data);
        setStage(16);
        setCurrentPairIndex(0);
        setWinners([]);
        setSelectedIdx(null);
      } catch (err) {
        Alert.alert('에러', '랜덤 음악을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRandomMusic();
  }, []);

  // 라운드가 끝나면 다음 라운드로 진출
  useEffect(() => {
    if (winners.length === stage / 2 && winners.length > 0) {
      setRoundTracks(winners);
      setStage(stage / 2);
      setCurrentPairIndex(0);
      setWinners([]);
      setSelectedIdx(null);
    }
  }, [winners]);

  //월드컵 새로고침
  const handleRefresh = () => {
    Alert.alert(
      '초기화',
      '정말 초기화하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const data = await getRandomMusic(16);
              setMusicList(data);
              setRoundTracks(data);
              setStage(16);
              setCurrentPairIndex(0);
              setWinners([]);
              setSelectedIdx(null);
            } catch (err) {
              Alert.alert('에러', '랜덤 음악을 불러오지 못했습니다.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // 카드 선택 핸들러
  const handleSelect = (track: Track, idx: number) => {
    setSelectedIdx(idx);
    setTimeout(() => {
      setWinners(prev => [...prev, track]);
      setCurrentPairIndex(prev => prev + 1);
      setSelectedIdx(null);
    }, 300);
  };

  // 곡 재생 핸들러
  const handlePlay = async (track: Track) => {
    try {
      setIsLoading(true);

      // 이미 재생 중인 곡을 다시 누르면 "정지"
      if (playingId === track.id) {
        await TrackPlayer.pause();
        setPlayingId(null);
        return;
      }

      setPlayingId(track.id);

      await playMusicService(track);
      await TrackPlayer.play();
    } catch (err) {
      Alert.alert('재생 오류', '음악을 재생할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 월드컵 종료시 렌더링 화면
  if (stage == 1) {
    const winner = roundTracks[0];
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <View style={styles.headerContainer}>
          <View style={{flex: 1}} />
          <Text style={[styles.finalText, {flex: 2}]}>우승곡!</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={{flex: 1, alignItems: 'center'}}>
            <Image
              source={require('../../asset/images/refresh.png')}
              style={styles.refreshImage}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.finalMusicCard}>
          <Image
            source={{uri: winner.snippet?.thumbnails?.medium?.url}}
            style={styles.finalImage}
          />
          <Text style={styles.finalMusicTitle} numberOfLines={2}>
            {winner.snippet?.title}
          </Text>
          <Text style={styles.finalMusicArtist}>
            {winner.snippet?.channelTitle}
          </Text>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlay(winner)}>
            <Text style={styles.playButtonText}>재생</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 현재 보여줄 두 곡
  const pair = roundTracks.slice(
    currentPairIndex * 2,
    currentPairIndex * 2 + 2,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{flex: 1}} />
        <Text style={[styles.roundTitle, {flex: 2}]}>
          {(() => {
            const round = getRoundFormatTitle(stage, currentPairIndex);
            if (round === '결승' || round === '준결승') {
              return round;
            }
            const match = round.match(/^(.+?)\s*(\(.+\))$/);
            if (match) {
              return (
                <>
                  {match[1]}
                  <View style={{width: 5}} />
                  <Text style={styles.roundBracket}>{match[2]}</Text>
                </>
              );
            }
            return round;
          })()}
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{flex: 1, alignItems: 'center'}}>
          <Image
            source={require('../../asset/images/refresh.png')}
            style={styles.refreshImage}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.pairContainer}>
        {pair.map((track, idx) => (
          <TouchableOpacity
            key={`${track.id?.videoId || track.id}_${idx}`}
            style={[
              styles.musicCard,
              selectedIdx === idx && styles.selectedMusicCard,
            ]}
            activeOpacity={0.85}
            onPress={() => handleSelect(track, idx)}>
            <Image
              source={{uri: track.snippet?.thumbnails?.medium?.url}}
              style={styles.thumbnailImage}
            />
            <Text style={styles.msuicCardTitle} numberOfLines={2}>
              {track.snippet?.title}
            </Text>
            <Text style={styles.musicCardArtist} numberOfLines={1}>
              {track.snippet?.channelTitle}
            </Text>
            <TouchableOpacity
              style={[
                styles.playButton,
                playingId === (track.id?.videoId || track.id) &&
                  styles.playingButton,
              ]}
              onPress={() => handlePlay(track)}
              activeOpacity={0.7}>
              <Text style={styles.playButtonText}>
                {playingId === (track.id?.videoId || track.id)
                  ? '정지'
                  : '재생'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green_1DB954} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    marginHorizontal: 40,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roundTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.black_1c1c1c,
  },
  refreshImage: {
    width: 30,
    height: 30,
  },
  pairContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  musicCard: {
    width: '44%',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMusicCard: {
    borderColor: colors.green_1DB954,
    shadowColor: colors.green_1DB954,
    shadowOpacity: 0.3,
    transform: [{scale: 1.05}],
  },
  thumbnailImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
    marginBottom: 12,
  },
  msuicCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black_1c1c1c,
    marginBottom: 4,
    textAlign: 'center',
  },
  musicCardArtist: {
    fontSize: 14,
    color: colors.gray_808080,
    marginBottom: 10,
    textAlign: 'center',
  },
  playButton: {
    marginTop: 4,
    backgroundColor: colors.green_1DB954,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 6,
    shadowColor: colors.green_1DB954,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  playingButton: {
    backgroundColor: colors.black_1c1c1c,
  },
  finalMusicCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    alignItems: 'center',
    padding: 28,
    shadowColor: colors.green_1DB954,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
    alignSelf: 'center',
  },
  finalText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.green_1DB954,
  },
  finalImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    margin: 20,
  },
  finalMusicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.black_1c1c1c,
    marginBottom: 6,
    textAlign: 'center',
  },
  finalMusicArtist: {
    fontSize: 16,
    color: colors.gray_808080,
    marginBottom: 16,
    textAlign: 'center',
  },
  playButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  roundBracket: {
    color: colors.gray_a9a9a9,
    fontSize: 18,
    fontWeight: 'normal',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default MusicWorldCupScreen;
