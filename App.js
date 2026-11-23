import BootSplash from 'react-native-bootsplash';
import {View, StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {HomeScreen} from './scr/screens/homescreen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {HymScreen} from './scr/screens/hyms.screen';
import {styles} from './scr/styles/global.styles';
import { colors } from './scr/config/colors';
import { HymnDetailScreen } from './scr/screens/hymnDetailScreen';

const Stack = createStackNavigator();

const MainScreen = () => {
  return (
    <View style={styles.containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
      <Stack.Navigator initialRouteName='HomeScreen' screenOptions={{headerShown: false}}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="HymScreen" component={HymScreen} />
        <Stack.Screen name="HymnDetails" component={HymnDetailScreen} />
      </Stack.Navigator>
    </View>
  );
};

export default function App() {
  BootSplash.hide({fade: true});

  return (
    <GestureHandlerRootView style={styles.containerStyle}>
      <NavigationContainer>
        <MainScreen />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
