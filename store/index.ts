import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['recentSearches', 'playMusic', 'playlist'], //영구저장
  blacklist: [''], //영구저장 x
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      //redux-persist 액션 타입 무시 설정
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export * from './rootReducer';
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
