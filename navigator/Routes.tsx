import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';

import {RootStackParamList} from '../model/model';

import HomeScreen from '../screen/home/HomeScreen';

import NewMusicScreen from '../screen/newMusic/NewMusicScreen';

import SearchScreen from '../screen/search/SearchScreen';

import StorageScreen from '../screen/storage/StorageScreen';
import PlaylistScreen from '../screen/storage/PlaylistScreen';

import AllMenuScreen from '../screen/allMenu/AllMenuScreen';

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

function NewMusicStack() {
  return (
    <Stack.Navigator
      initialRouteName="newMusicScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="newMusicScreen" component={NewMusicScreen} />
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

function StorageStack() {
  return (
    <Stack.Navigator
      initialRouteName="storageScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="storageScreen" component={StorageScreen} />
      <Stack.Screen name="playlistScreen" component={PlaylistScreen} />
    </Stack.Navigator>
  );
}

function MenuStack() {
  return (
    <Stack.Navigator
      initialRouteName="allMenuScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="allMenuScreen" component={AllMenuScreen} />
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
        name="newMusicStack"
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
        name="storageStack"
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
        listeners={({navigation}) => ({
          tabPress: e => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'storageStack',
                  state: {
                    routes: [{name: 'storageScreen'}],
                    index: 0,
                  },
                },
              ],
            });
          },
        })}
      />
      <Tab.Screen
        name="menuStack"
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
