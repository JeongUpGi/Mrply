import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';

import {RootStackParamList} from '../model/model';

import HomeScreen from '../screen/home/homeScreen';
import NewMusicScreen from '../screen/newMusic/newMusicScreen';
import SearchScreen from '../screen/search/searchScreen';
import StorageScreen from '../screen/storage/storageScreen';
import AllMenuScreen from '../screen/allMenu/allMenuScreen';
import PlayingMusicScreen from '../screen/common/playingMusicScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="homeScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="homeScreen" component={HomeScreen} />
      <Stack.Screen name="playingMusicScreen" component={PlayingMusicScreen} />
    </Stack.Navigator>
  );
}

function NewMusicStack() {
  return (
    <Stack.Navigator
      initialRouteName="newMusicScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="newMusicScreen" component={NewMusicScreen} />
      <Stack.Screen name="playingMusicScreen" component={PlayingMusicScreen} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator
      initialRouteName="searchScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="searchScreen" component={SearchScreen} />
      <Stack.Screen name="playingMusicScreen" component={PlayingMusicScreen} />
    </Stack.Navigator>
  );
}

function StorageStack() {
  return (
    <Stack.Navigator
      initialRouteName="storageScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="storageScreen" component={StorageScreen} />
      <Stack.Screen name="playingMusicScreen" component={PlayingMusicScreen} />
    </Stack.Navigator>
  );
}

function MenuStack() {
  return (
    <Stack.Navigator
      initialRouteName="allMenuScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="allMenuScreen" component={AllMenuScreen} />
      <Stack.Screen name="playingMusicScreen" component={PlayingMusicScreen} />
    </Stack.Navigator>
  );
}

function MainBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8e8e93',
      }}>
      <Tab.Screen
        name="홈"
        component={HomeStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/home.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="새로운 음악"
        component={NewMusicStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/electric_lightbulb.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '새로운 음악',
        }}
      />
      <Tab.Screen
        name="검색"
        component={SearchStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/search.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '검색',
        }}
      />
      <Tab.Screen
        name="보관함"
        component={StorageStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/music_storage.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '보관함',
        }}
      />
      <Tab.Screen
        name="전체 메뉴"
        component={MenuStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/all_menu.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '전체 메뉴',
        }}
      />
    </Tab.Navigator>
  );
}

export default MainBottomTabs;
