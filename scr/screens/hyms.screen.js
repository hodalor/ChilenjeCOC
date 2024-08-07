import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {hymScreenStyles, styles} from '../styles/global.styles';
import {HymnScreenHeader} from '../components/hymnScreenHeaderCompanent';
import {HymnCard} from '../components/hymnCard';

export const HymScreen = ({route, navigation}) => {
  const data = route.params.data;
  return (
    <View style={styles.componentsContainerStyle}>
      <HymnScreenHeader
        _goBack={() => navigation.goBack()}
        title={data.language}
      />
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={hymScreenStyles.containerStyle}>
          <View style={hymScreenStyles.titleBarStyle}>
            <Text style={hymScreenStyles.titBarTextStyle}>Hymns : {data.hyms.length}</Text>
          </View>
          {data.hyms.map((hymn, index) => {
            return <HymnCard key={index} hymn={hymn} />;
          })}
        </View>
      </ScrollView>
    </View>
  );
};
