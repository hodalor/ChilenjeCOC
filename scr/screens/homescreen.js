import React from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {data} from '../db';
import {homescreenStyles} from '../styles/global.styles';
import {LangCard} from '../components/languageCard';

export function HomeScreen({navigation}) {
  return (
    <View style={homescreenStyles.mainContainer}>
      <View style={homescreenStyles.topViewStyle}>
        <Text style={homescreenStyles.headerTextStyle}>
          Chilenje Church Of Christ
        </Text>
        <Text style={homescreenStyles.smallText}>Hyms Mobile App</Text>
      </View>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={homescreenStyles.componentsContainerStyle}>
          {data.map((db, index) => {
            return (
              <LangCard
                key={index}
                _onPressEvent={() =>
                  navigation.navigate('HymScreen', {data: db})
                }
                title={db.language}
              />
            );
          })}
        </View>
        <View style={homescreenStyles.poweredByStyle}>
          <Text style>Powered By CodeLab</Text>
        </View>
      </ScrollView>
    </View>
  );
}
