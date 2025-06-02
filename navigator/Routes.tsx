import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import homeScreen from '../screen/homeScreen';
import newMusicScreen from '../screen/newMusicScreen';
import searchScreen from '../screen/searchScreen';
import storageScreen from '../screen/storageScreen';
import allMenuScreen from '../screen/allMenuScreen';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8e8e93',
      }}>
      <Tab.Screen
        name="homeScreen"
        component={homeScreen}
        options={{
          // tabBarShowLabel: false,
          tabBarLabel: '홈',
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/home.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="newMusicScreen"
        component={newMusicScreen}
        options={{
          // tabBarShowLabel: false,
          tabBarLabel: '새로운 음악',
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/music_storage.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="searchScreen"
        component={searchScreen}
        options={{
          // tabBarShowLabel: false,
          tabBarLabel: '검색',
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/search.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="storageScreen"
        component={storageScreen}
        options={{
          // tabBarShowLabel: false,
          tabBarLabel: '보관함',
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/electric_lightbulb.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="allMenuScreen"
        component={allMenuScreen}
        options={{
          // tabBarShowLabel: false,
          tabBarLabel: '전체 메뉴',
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/all_menu.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
