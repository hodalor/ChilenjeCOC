import React, {useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';
import {
  hymnDetailsCreenStyles,
  styles,
} from '../styles/global.styles';
import {HymnScreenHeader} from '../components/hymnScreenHeaderCompanent';
import {ChorusCard} from '../components/chorusCard';
import {StanzaCard} from '../components/stanzerCard';

const MIN_SCALE = 0.85;
const MAX_SCALE = 2.6;

const clampScale = value => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export const HymnDetailScreen = ({route, navigation}) => {
  const data = route.params.data;
  const scaleRef = useRef(1);
  const pinchStartRef = useRef(1);
  const [scale, setScale] = useState(1);

  const applyScale = next => {
    const clamped = clampScale(next);
    scaleRef.current = clamped;
    setScale(clamped);
  };

  const onPinchEvent = event => {
    applyScale(pinchStartRef.current * event.nativeEvent.scale);
  };

  const onPinchStateChange = event => {
    if (event.nativeEvent.state === State.BEGAN) {
      pinchStartRef.current = scaleRef.current;
    }
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const next = clampScale(pinchStartRef.current * event.nativeEvent.scale);
      pinchStartRef.current = next;
      applyScale(next);
    }
  };

  return (
    <View style={styles.componentsContainerStyle}>
      <HymnScreenHeader _goBack={() => navigation.goBack()} />
      <View style={hymnDetailsCreenStyles.containerStyle}>
        <PinchGestureHandler
          onGestureEvent={onPinchEvent}
          onHandlerStateChange={onPinchStateChange}>
          <ScrollView
            style={hymnDetailsCreenStyles.lyricsScroll}
            collapsable={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={hymnDetailsCreenStyles.lyricsContent}>
            <ChorusCard hymn={data} scale={scale} />
            {(data.stanzers || []).map((stanza, index) => (
              <StanzaCard key={`${stanza.stanzer}-${index}`} stanza={stanza} scale={scale} />
            ))}
          </ScrollView>
        </PinchGestureHandler>
      </View>
    </View>
  );
};
