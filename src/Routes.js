import React from 'react';
import { createStackNavigator } from 'react-navigation';
import HomeScreen from './screens/Home';
import MapScreen from './screens/Map';

const RootStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Map: {
    screen: MapScreen,
  },
});

const Routes = () => <RootStack />;

export default Routes;
