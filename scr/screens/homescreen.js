import React from 'react';
import {View, Text, FlatList, Pressable, Linking} from 'react-native';
import {data} from '../db';
import {homescreenStyles} from '../styles/global.styles';
import {LangCard} from '../components/languageCard';

export function HomeScreen({navigation}) {
  return (
    <View style={homescreenStyles.mainContainer}>
      <View style={homescreenStyles.topViewStyle}>
        <Text style={homescreenStyles.headerTextStyle}>
          Church Of Christ
        </Text>
        <Text style={homescreenStyles.smallText}>Hymns Mobile App</Text>
      </View>

      <View style={homescreenStyles.componentsContainerStyle}>
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={item => item.language}
          renderItem={({item}) => (
            <LangCard
              _onPressEvent={() => navigation.navigate('HymScreen', {data: item})}
              title={item.language}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={homescreenStyles.contentContainerStyle}
          columnWrapperStyle={homescreenStyles.columnWrapperStyle}
        />
      </View>
      <Pressable onPress={() => Linking.openURL('https://codelabfirm.netlify.app')} style={homescreenStyles.poweredByStyle}>
        <Text style={homescreenStyles.poweredbyText}>Powered By Chilenje COC media Team</Text>
      </Pressable>
    </View>
  );
}
