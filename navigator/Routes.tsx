import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';

import {RootStackParamList} from '../model/model';

import HomeScreen from '../screen/home/HomeScreen';

import MusicWorldCupScreen from '../screen/musicWorldCup/MusicWorldCupScreen';

import SearchScreen from '../screen/search/SearchScreen';

// import StorageScreen from '../screen/storage/StorageScreen';
import PlaylistScreen from '../screen/storage/PlaylistScreen';
import PlaylistDetailScreen from '../screen/storage/PlaylistDetailScreen';

import PlayingMusicScreen from '../screen/common/PlayingMusicScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="homeScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="homeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function MusicWorldCupStack() {
  return (
    <Stack.Navigator
      initialRouteName="musicWorldCupScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="musicWorldCupScreen"
        component={MusicWorldCupScreen}
      />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator
      initialRouteName="searchScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="searchScreen" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function PlaylistStack() {
  return (
    <Stack.Navigator
      initialRouteName="playlistScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="playlistScreen" component={PlaylistScreen} />
      <Stack.Screen
        name="playlistDetailScreen"
        component={PlaylistDetailScreen}
      />
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
        name="homeStack"
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
        name="musicWorldCupStack"
        component={MusicWorldCupStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/ranking.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '음악 월드컵',
        }}
      />
      <Tab.Screen
        name="searchStack"
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
        name="playlistStack"
        component={PlaylistStack}
        options={{
          tabBarIcon: ({color, size}) => (
            <Image
              source={require('../asset/images/music_storage.png')}
              style={{width: size, height: size, tintColor: color}}
            />
          ),
          tabBarLabel: '플레이리스트',
        }}
      />
    </Tab.Navigator>
  );
}

// **루트 스택 네비게이터 정의**
function RootStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="mainBottomTabs" component={MainBottomTabs} />
      <Stack.Screen name="playingMusicScreen" component={PlayingMusicScreen} />
      {/* <Stack.Screen name="playlistScreen" component={PlaylistScreen} /> */}
    </Stack.Navigator>
  );
}

export default RootStackNavigator;
