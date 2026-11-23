import React from 'react';
import {Text, View} from 'react-native';
import {chorusCardStyles} from '../styles/global.styles';
import {colors} from '../config/colors';

const verseCount = hymn =>
  (hymn.stanzers || []).filter(stanza => stanza.type !== 'chorus').length;

export const ChorusCard = ({hymn, scale = 1}) => {
  const chorusLines = Array.isArray(hymn.chorus)
    ? hymn.chorus.filter(line => line && String(line).trim())
    : [];
  const hasInlineChorus = (hymn.stanzers || []).some(
    stanza => stanza.type === 'chorus',
  );
  const fontSize = Math.round(16 * scale);
  const lineHeight = Math.round(24 * scale);
  const titleSize = Math.max(16, Math.round(16 * Math.min(scale, 1.6)));

  return (
    <View style={chorusCardStyles.containerStyle}>
      <View style={[chorusCardStyles.titleplaceStyle, {height: undefined, minHeight: 45, alignItems: 'center'}]}>
        <Text style={{color: colors.primaryColor, fontWeight: 'bold', fontSize: titleSize}}>
          {hymn.hymnNo}
        </Text>
        <Text style={[chorusCardStyles.hymnTitleStyle, {fontSize: titleSize, flex: 1, textAlign: 'center'}]}>
          {hymn.title}
        </Text>
        <Text style={{color: '#666666', fontSize: Math.round(13 * Math.min(scale, 1.4))}}>
          {`${verseCount(hymn)} Stanzas`}
        </Text>
      </View>
      {chorusLines.length ? (
        <>
          <Text style={[chorusCardStyles.chorusTitletyle, {fontSize: Math.round(15 * scale)}]}>
            Chorus
          </Text>
          <View style={chorusCardStyles.chorusSectionStyle}>
            {chorusLines.map((line, index) => (
              <Text
                style={[chorusCardStyles.chorusSectionTextStyle, {fontSize, lineHeight}]}
                key={index}>
                {line}
              </Text>
            ))}
          </View>
        </>
      ) : hasInlineChorus ? null : (
        <>
          <Text style={chorusCardStyles.chorusTitletyle}>Chorus</Text>
          <Text style={[chorusCardStyles.noChorusText, {fontSize}]}>No Chorus</Text>
        </>
      )}
    </View>
  );
};
