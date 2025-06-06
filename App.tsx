import React from 'react';
import {Provider} from 'react-redux'; // react-redux의 Provider 임포트
import {PersistGate} from 'redux-persist/integration/react'; // redux-persist의 PersistGate 임포트
import {store, persistor} from './store';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator} from 'react-native';
import BottomTabs from './navigator/Routes';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
        persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <BottomTabs />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
