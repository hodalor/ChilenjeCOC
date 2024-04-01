import React from 'react-native';
import {View, Text, ScrollView, FlatList} from 'react-native';
import {data} from './scr/db';

export default function App() {
  // console.log(data.Chichewa);
  return (
    <View >
      
      <ScrollView>
        {data.Chichewa.map((item, index) => {
          return (
            <View key={index} style={{display: 'flex', alignItems: 'center'}}>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontWeight: 'bold', marginRight: '1%'}}>
                  {item.hymnNo}
                </Text>
                <Text style={{fontWeight: 'bold'}}>{item.title}</Text>
              </View>
              <Text style={{fontWeight: 'bold'}}>{item.creator}</Text>
              <View>
                {item.stanzars.map((stanser, i) => {
                  return (
                    <View
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        margin: '5%',
                      }}>
                      <Text style={{fontWeight: 'bold', marginRight: '1%'}}>
                        {stanser.stanzer}
                      </Text>
                      <FlatList
                      
                        data={stanser.lines}
                        renderItem={({item}) => <Text>{item}</Text>}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
