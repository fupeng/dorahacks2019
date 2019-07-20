import React from "react";
import {
    View,
    Text
} from "react-native";
import {
    createStackNavigator,
    createAppContainer
} from "react-navigation";

import Home from "./Home"

import { mapping, light as lightTheme } from '@eva-design/eva';
import { ApplicationProvider, Layout } from 'react-native-ui-kitten';




const AppNavigator = createStackNavigator({
  Home: Home,
}, {
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return (
      <ApplicationProvider
      mapping={mapping}
      theme={lightTheme}>
      <AppContainer/>
    </ApplicationProvider>
    )
  }
}
