import React from 'react';
import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {PlayingMusicBarProps} from '../../model/model';
import {colors} from '../../asset/color/color';

const playingMusicBar: React.FC<PlayingMusicBarProps> = ({
  imageUrl,
  musicTitle,
}) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.thumbnailWrapper}>
        <Image style={styles.thumbnail} source={{uri: imageUrl}} />
      </View>
      <View style={styles.musicTitleWrapper}>
        <Text>{musicTitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: colors.gray_d3d3d3,
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
    borderColor: colors.gray_d3d3d3,
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
  musicTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default playingMusicBar;
