import React, {useCallback, useEffect, useState} from 'react';
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
import {
  getRandomMusic,
  saveWinLog,
  getTotalWinner,
  savePlayLog,
} from '../../network/network';
import TrackPlayer, {
  Track,
  usePlaybackState,
  State,
} from 'react-native-track-player';
import {colors} from '../../asset/color/color';
import {
  convertMusicRankItemToTrack,
  formatDateTime,
  getRoundFormatTitle,
} from '../../utils/formatHelpers';
import {useDispatch} from 'react-redux';
import {playMusicService} from '../../service/musicService';
import {
  setActiveSource,
  setIsPlaying,
  setIsPlayingMusicBarVisible,
} from '../../store/slices/playMusicSlice';
import {useFocusEffect} from '@react-navigation/native';
import {totalWinnerItem} from '../../model/model';

const dummyTopWinner = {
  title: '아이유 (IU) - Blueming',
  artist: '아이유 (IU)',
  artwork: 'https://i.ytimg.com/vi/D1PvIWdJ8xo/hqdefault.jpg',
  winCount: 3,
  lastWin: '2024-06-28',
};

const MusicWorldCupScreen = () => {
  const [musicList, setMusicList] = useState<any[]>([]);
  const [roundTracks, setRoundTracks] = useState<any[]>([]);
  const [totalWinner, setTotalWinner] = useState<totalWinnerItem>();
  const [winners, setWinners] = useState<any[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [stage, setStage] = useState(16);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const dispatch = useDispatch();

  const playbackState = usePlaybackState();

  const fetchTotalWinner = useCallback(async () => {
    try {
      const resData = await getTotalWinner();
      setTotalWinner(resData);
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
      fetchTotalWinner();
    }, [fetchTotalWinner]),
  );

  useEffect(() => {
    const fetchRandomMusic = async () => {
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

  useEffect(() => {
    const saveWinMusicItem = async () => {
      await saveWinLog(roundTracks[0]);
      await fetchTotalWinner();
    };
    if (stage === 1) {
      saveWinMusicItem();
    }
  }, [stage]);

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

  // 상단 우승 곡 선택 핸들러 ( =곡 재생 )
  const handlePressTopWinnerCard = async () => {
    if (!totalWinner) return;
    const track = convertMusicRankItemToTrack(totalWinner);
    try {
      dispatch(setIsPlayingMusicBarVisible(true));
      dispatch(setActiveSource('normal'));
      await playMusicService(track);

      const saveLogRes = await savePlayLog(track);
      if (!saveLogRes) {
        Alert.alert(
          '재생 기록 저장 실패',
          '음악 재생 로그 저장에 실패했습니다.',
        );
      }
    } catch (err: any) {
      console.error('음악 재생 오류:', err);
      Alert.alert('음악 재생 오류', err.message);
    }
  };

  // 곡 재생 핸들러
  const handlePlay = async (track: Track) => {
    try {

      const trackId = track.id?.videoId || track.id;

      setPlayingId(trackId);

      dispatch(setActiveSource('normal'));
      await playMusicService(track);

      // 이미 재생 중인 곡을 다시 누르면 "정지"
      if (playingId === trackId && playbackState.state === State.Playing) {
        await TrackPlayer.pause();
        dispatch(setIsPlaying(false));
        return;
      }
    } catch (err) {
      Alert.alert('재생 오류', '음악을 재생할 수 없습니다.');
    }
  };

  const TopWinnerMusicCard = () =>
    totalWinner && totalWinner.id ? (
      <TouchableOpacity
        style={styles.topWinnerCard}
        onPress={handlePressTopWinnerCard}>
        <View style={styles.topWinnerLeft}>
          <Image
            source={{uri: totalWinner.thumbnail_url}}
            style={styles.topWinnerImage}
          />
          <View style={styles.topWinnerInfo}>
            <Text style={styles.topWinnerTitle} numberOfLines={1}>
              {totalWinner.title}
            </Text>
            <Text style={styles.topWinnerArtist} numberOfLines={1}>
              {totalWinner.artist}
            </Text>
            <Text style={styles.topWinnerCount}>
              🏆 {totalWinner.win_count}회 우승
            </Text>
            <Text style={styles.topWinnerDate}>
              최근 우승: {formatDateTime(totalWinner.last_win_date)}
            </Text>
          </View>
        </View>
        <View style={styles.trophyWrapper}>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>
      </TouchableOpacity>
    ) : (
      <View
        style={[
          styles.topWinnerCard,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text style={{fontSize: 16, color: '#888'}}>
          역대 우승곡이 없습니다
        </Text>
      </View>
    );

  // 월드컵 종료시 렌더링 화면
  if (stage === 1) {
    const winner = roundTracks[0];
    return (
      <SafeAreaView style={styles.container}>
        <TopWinnerMusicCard />
        <View style={styles.center}>
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
      <TopWinnerMusicCard />
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
                playbackState.state === State.Playing
                  ? styles.playingButton
                  : null,
              ]}
              onPress={() => handlePlay(track)}
              activeOpacity={0.7}>
              <Text style={styles.playButtonText}>
                {playingId === (track.id?.videoId || track.id) &&
                playbackState.state === State.Playing
                  ? '정지'
                  : '재생'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: 'center',
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
  topWinnerCard: {
    padding: 16,
    marginTop: 10,
    marginBottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  topWinnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topWinnerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  topWinnerInfo: {
    flex: 1,
  },
  topWinnerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  topWinnerArtist: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  topWinnerCount: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: 'bold',
  },
  topWinnerDate: {
    fontSize: 13,
    color: '#888',
  },
  trophyWrapper: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyIcon: {
    fontSize: 32,
    color: '#FFD700',
  },
});

export default MusicWorldCupScreen;
