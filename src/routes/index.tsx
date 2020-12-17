import 'react-native-gesture-handler';
import React from 'react';
import {Names} from './routesnames';

import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './../screens/Home';

const MainStack = createStackNavigator();

const routes: React.FC = () => {
  return (
    <MainStack.Navigator headerMode="none" initialRouteName={Names.HOME}>
      <MainStack.Screen name={Names.HOME} component={HomeScreen} />
    </MainStack.Navigator>
  );
};

export default routes;
