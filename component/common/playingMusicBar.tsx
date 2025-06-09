import React from 'react';
import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {PlayingMusicBarProps} from '../../model/model';
import {colors} from '../../asset/color/color';
import Slider from '@react-native-community/slider';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../../model/model';

const playingMusicBar: React.FC<PlayingMusicBarProps> = ({
  imageUrl,
  musicTitle,
}) => {
  const progress = useProgress();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBarPress = () => {
    navigation.navigate('playingMusicScreen');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleBarPress}>
      <View style={styles.thumbnailWrapper}>
        <Image style={styles.thumbnail} source={{uri: imageUrl}} />
      </View>
      <View style={styles.progressBarWrapper}>
        <View style={styles.musicTitle}>
          <Text>{musicTitle}</Text>
        </View>
        <Slider
          style={styles.progressBarSlider}
          minimumValue={0}
          maximumValue={progress.duration > 0 ? progress.duration : 1}
          value={progress.position || 0}
          onSlidingComplete={async value => {
            await TrackPlayer.seekTo(value); //track-player 선택값으로 설정
          }}
          minimumTrackTintColor={colors.green_1DB954}
          maximumTrackTintColor={colors.gray_a9a9a9}
          thumbTintColor={colors.white}
          //   thumbImage={require('../../asset/images/circle_gray.png')}
        />
        <View style={styles.timeWrapper}>
          <Text style={styles.time}>{formatTime(progress.position)}</Text>
          <Text style={styles.time}>{formatTime(progress.duration)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: colors.gray_dcdcdc,
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.gray_dcdcdc,
    marginBottom: 10,
  },
  thumbnailWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  thumbnail: {
    height: 60,
    width: 60,
    borderRadius: 10,
  },
  musicTitle: {
    flex: 1,
  },
  progressBarWrapper: {
    width: '80%',
  },
  progressBarSlider: {
    width: '100%',
    height: 20,
  },
  timeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: '100%',
  },
  time: {
    color: colors.gray_808080,
    fontSize: 15,
  },
});

export default playingMusicBar;
