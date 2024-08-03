import BootSplash from 'react-native-bootsplash';
import {View, StatusBar} from 'react-native';
import {HomeScreen} from './scr/screens/homescreen';

export default function App() {
  BootSplash.hide({fade: true});

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <HomeScreen />
    </View>
  );
}
