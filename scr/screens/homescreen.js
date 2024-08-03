import React from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {data} from '../db';

export function HomeScreen() {
  const _handleClick = language => {
    console.log(language);
  };
  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {data.map((db, index) => {
            return (
              <Pressable
                onPress={() => _handleClick(db.language)}
                key={index}
                style={{
                  marginVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  border: 'solid',
                  width: '50%',
                  borderColor: '#283593',
                  height: 45,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 20, color: '#283593'}}>
                  {db.language}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
