import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {hymnCardStyle} from '../styles/global.styles';

export const HymnCard = ({hymn}) => {
  return (
    <View style={[hymnCardStyle.containerStyle, hymnCardStyle.elevation]}>
      <View style={hymnCardStyle.hymnNumberStyle}>
        <Text>{hymn.hymnNo}</Text>
      </View>
      <View style={hymnCardStyle.titleStyle}>
        <Text style={hymnCardStyle.subtitleTextStyle}>{hymn.title}</Text>
      </View>
      <View style={hymnCardStyle.creatorViewStyle}>
        <Text style={hymnCardStyle.creatorTextStyle}>{hymn.creator}</Text>
        <Pressable onPress={() => console.log(hymn.chorus)} style={hymnCardStyle.readhymmButtonStyle}>
          <Text>Read</Text>
        </Pressable>
      </View>
    </View>
  );
};
