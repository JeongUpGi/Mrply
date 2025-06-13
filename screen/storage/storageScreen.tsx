import React from 'react';
import {SafeAreaView, View, Text, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {colors} from '../../asset/color/color';

const StorageScreen = () => {
  const storedPlaylists = useSelector(
    (state: RootState) => state.storage.storedPlaylists,
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>보관함(플레이리스트)</Text>
      {storedPlaylists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>보관함이 비어있습니다</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray_c0c0c0,
    fontSize: 20,
  },
});

export default StorageScreen;
