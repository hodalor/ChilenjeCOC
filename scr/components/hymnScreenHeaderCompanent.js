import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {hymScreenStyles} from '../styles/global.styles';
import {MyIcon} from './icons';
import { colors } from '../config/colors';

export const HymnScreenHeader = ({title, _goBack}) => {
  return (
    <View style={hymScreenStyles.headerComponentstyle}>
      <Pressable onPress={_goBack}>
        {MyIcon({name: 'chevron-back-outline', size: 25, color: colors.fadedTextprimary})}
      </Pressable>
      <Text style={hymScreenStyles.headerMiddleCompStyle}>CCC</Text>
      <Text style={hymScreenStyles.headerTitleStyle}>{title}</Text>
    </View>
  );
};
