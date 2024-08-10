import React from 'react';
import {View, Text, ScrollView, Pressable, Linking} from 'react-native';
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

      <View style={homescreenStyles.componentsContainerStyle}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <View style={homescreenStyles.contentContainerStyle}>
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
        </ScrollView>
      </View>
      <Pressable onPress={() => Linking.openURL('https://codelabfirm.netlify.app')} style={homescreenStyles.poweredByStyle}>
        <Text style={homescreenStyles.poweredbyText}>Powered By CodeLab</Text>
      </Pressable>
    </View>
  );
}
