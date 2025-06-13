import React from 'react';
import {
  SafeAreaView,
  Text,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../../asset/color/color';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../model/model';

import {Header} from '../../component/common/Header';

const StorageScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const categoryData = [
    {
      imageUrl: require('../../asset/images/playlist_green.png'),
      title: '플레이리스트',
      onPress: () => {
        navigation.navigate('playlistScreen');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header.onlyLeftTitle title="보관함" titleStyle={styles.title} />
      <View style={styles.categoryListContainer}>
        {categoryData.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.categoryListWrapper}
              onPress={item.onPress}>
              <View style={styles.categoryLeftSection}>
                <Image source={item.imageUrl} style={styles.categoryImage} />
                <Text style={styles.cateogryTitle}>{item.title}</Text>
              </View>
              <View style={styles.categoryRightSection}>
                <Image
                  source={require('../../asset/images/next_fill_white.png')}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: colors.green_1DB954,
                  }}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.black,
  },
  categoryListContainer: {
    paddingHorizontal: 20,
  },
  categoryListWrapper: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray_d3d3d3,
    justifyContent: 'space-between',
    padding: 5,
  },
  categoryImage: {
    width: 30,
    height: 30,
    tintColor: colors.green_1DB954,
  },
  cateogryTitle: {
    color: colors.black,
    fontSize: 22,
    marginLeft: 10,
  },
  categoryLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryRightSection: {
    justifyContent: 'center',
  },
});

export default StorageScreen;
