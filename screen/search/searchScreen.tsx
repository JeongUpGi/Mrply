import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';

import {searchVideos} from '../../network/networkRequest';
import {colors} from '../../asset/color/color';

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleInputCancel = () => {
    setInputFocused(false);
    setSearchText('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Image
            source={require('../../asset/images/search.png')}
            style={{width: 20, height: 20, tintColor: colors.gray_808080}}
          />
          <TextInput
            style={styles.input}
            placeholder="아티스트, 노래, 가사"
            placeholderTextColor={colors.gray_808080}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            ref={inputRef}
          />
        </View>
        {inputFocused && (
          <TouchableOpacity
            style={styles.cancelButtonTextWrapper}
            onPress={handleInputCancel}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 50,
    marginHorizontal: 30,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flex: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.gray_dcdcdc,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: colors.gray_dcdcdc,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    marginLeft: 5,
  },
  cancelButtonTextWrapper: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    color: colors.red,
    textAlign: 'center',
  },
});

export default SearchScreen;
