import React from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {HeaderProps} from '../../model/model';
import {colors} from '../../asset/color/color';

// 기본 헤더
const DefaultHeader: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  headerBackgroundColor,
  onPressLeft,
  onPressRight,
  titleStyle,
  leftIconStyle,
  rightIconStyle,
}) => {
  return (
    <View style={[styles.headerContainer, headerBackgroundColor]}>
      <TouchableOpacity style={styles.buttonWrapper} onPress={onPressLeft}>
        <Image source={leftIcon} style={leftIconStyle} />
      </TouchableOpacity>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <TouchableOpacity style={styles.buttonWrapper} onPress={onPressRight}>
        <Image source={rightIcon} style={rightIconStyle} />
      </TouchableOpacity>
    </View>
  );
};

//왼쪽 타이틀만 있는 헤더
const OnlyLeftTitleHeader: React.FC<HeaderProps> = ({title, titleStyle}) => {
  return (
    <View style={styles.whiteHeaderContainer}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    </View>
  );
};

// 아이콘이 있는 헤더
const LeftTitleRightIconHeader: React.FC<HeaderProps> = ({
  title,
  rightIcon,
  onPressRight,
  titleStyle,
  rightIconStyle,
}) => {
  return (
    <View style={styles.whiteHeaderContainer}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <TouchableOpacity style={styles.buttonWrapper} onPress={onPressRight}>
        <Image source={rightIcon} style={rightIconStyle} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  whiteHeaderContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export const Header = {
  default: DefaultHeader,
  onlyLeftTitle: OnlyLeftTitleHeader,
  leftTitleRightIcon: LeftTitleRightIconHeader,
};
