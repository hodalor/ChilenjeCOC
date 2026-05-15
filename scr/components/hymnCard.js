import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {hymnCardStyle} from '../styles/global.styles';

export const HymnCard = React.memo(({hymn, _onClick}) => {
  return (
    <Pressable onPress={_onClick} style={({pressed}) => [
      hymnCardStyle.containerStyle,
      hymnCardStyle.elevation,
      pressed && {opacity: 0.8}
    ]}>
      <View style={hymnCardStyle.titleStyle}>
        <Text style={hymnCardStyle.subtitleTextStyle}>{hymn.title}</Text>
        <View style={hymnCardStyle.hymnNumberStyle}>
          <Text style={hymnCardStyle.hymnNumberTextStyle}>{hymn.hymnNo}</Text>
        </View>
      </View>
      <View style={hymnCardStyle.creatorViewStyle}>
        <Text style={hymnCardStyle.creatorTextStyle}>{hymn.creator}</Text>
      </View>
    </Pressable>
  );
});
