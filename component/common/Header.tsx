import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {HeaderProps} from '../../model/model';

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onPressLeft,
  onPressRight,
  titleStyle,
  leftIconTextStyle,
  rightIconTextStyle,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.buttonWrapper} onPress={onPressLeft}>
        <Text style={leftIconTextStyle}> {leftIcon} </Text>
      </TouchableOpacity>
      <Text style={titleStyle}>{title}</Text>
      <TouchableOpacity style={styles.buttonWrapper} onPress={onPressRight}>
        <Text style={rightIconTextStyle}> {rightIcon} </Text>
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
  buttonWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
