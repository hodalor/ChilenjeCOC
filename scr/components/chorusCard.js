import React from 'react';
import {Text, View} from 'react-native';
import {chorusCardStyles} from '../styles/global.styles';

export const ChorusCard = ({hymn}) => {
  return (
    <View style={chorusCardStyles.containerStyle}>
      <View style={chorusCardStyles.titleplaceStyle}>
        <Text style={{color: "black"}}>{`No: ${hymn.hymnNo}`}</Text>
        <Text style={chorusCardStyles.hymnTitleStyle}>{hymn.title}</Text>
        <Text style={{color: "black"}}>{`Stanzers: ${hymn.stanzers.length}`}</Text>
      </View>
      <Text style={chorusCardStyles.chorusTitletyle}>Chorus :- </Text>
      {!hymn.chorus ? (
        <Text style={chorusCardStyles.noChorusText}>No Chorus</Text>
      ) : (
        <View style={chorusCardStyles.chorusSectionStyle}>
          {hymn.chorus.map((ch, index) => {
            return (
              <Text style={chorusCardStyles.chorusSectionTextStyle} key={index}>
                {ch}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
};
