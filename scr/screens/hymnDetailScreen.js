import React from 'react';
import {ScrollView, View} from 'react-native';
import {
  hymnDetailsCreenStyles,
  hymScreenStyles,
  styles,
} from '../styles/global.styles';
import {HymnScreenHeader} from '../components/hymnScreenHeaderCompanent';
import {ChorusCard} from '../components/chorusCard';
import {StanzaCard} from '../components/stanzerCard';

export const HymnDetailScreen = ({route, navigation}) => {
  let data = route.params.data;
  return (
    <View style={styles.componentsContainerStyle}>
      <HymnScreenHeader _goBack={() => navigation.goBack()} />
      <View style={hymnDetailsCreenStyles.containerStyle}>
        <ChorusCard hymn={data} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1, paddingVertical: 10}}>
          {data.stanzers.map((stanza, index) => {
            return <StanzaCard key={index} stanza={stanza} />;
          })}
        </ScrollView>
      </View>
    </View>
  );
};
