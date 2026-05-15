import React from 'react';
import {Text, View} from 'react-native';
import {stanzaCardStyles} from '../styles/global.styles';

export const StanzaCard = ({stanza}) => {
  return (
    <View style={stanzaCardStyles.constinerStyle}>
      <View style={stanzaCardStyles.stanzaNumberStyle}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Stanza {stanza.stanzer}</Text>
      </View>
      <View style={stanzaCardStyles.textCardstyles}>
        {stanza.lines.map((line, index) => {
          return (
            <Text style={stanzaCardStyles.stanzaLineStyle} key={index}>
              {line}
            </Text>
          );
        })}
      </View>
    </View>
  );
};
