import React from 'react';
import {Text, View} from 'react-native';
import {chorusCardStyles, stanzaCardStyles} from '../styles/global.styles';

export const StanzaCard = ({stanza, scale = 1}) => {
  const fontSize = Math.round(19 * scale);
  const lineHeight = Math.round(28 * scale);
  const lines = stanza.lines || [];

  if (stanza.type === 'chorus') {
    return (
      <View style={stanzaCardStyles.constinerStyle}>
        <View style={stanzaCardStyles.textCardstyles}>
          <Text style={[chorusCardStyles.chorusTitletyle, {fontSize: Math.round(15 * scale)}]}>
            {stanza.label || 'Chorus'}
          </Text>
          {lines.map((line, index) => (
            <Text
              style={[chorusCardStyles.chorusSectionTextStyle, {fontSize, lineHeight, width: '100%'}]}
              key={index}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={stanzaCardStyles.constinerStyle}>
      <View style={stanzaCardStyles.stanzaNumberStyle}>
        <Text style={{color: 'white', fontWeight: 'bold', fontSize: Math.round(13 * Math.min(scale, 1.5))}}>
          {`Stanza ${stanza.stanzer}`}
        </Text>
      </View>
      <View style={stanzaCardStyles.textCardstyles}>
        {lines.map((line, index) => (
          <Text
            style={[stanzaCardStyles.stanzaLineStyle, {fontSize, lineHeight}]}
            key={index}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
};
