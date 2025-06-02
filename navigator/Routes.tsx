import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import homeScreen from '../screen/homeScreen';
import myScreen from '../screen/myScreen';

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
          tabBarShowLabel: false,
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/home.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="myScreen"
        component={myScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: () => (
            <Image
              source={require('../asset/images/home.png')}
              style={{width: 24, height: 24}}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
