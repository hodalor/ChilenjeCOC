import React, { useState } from 'react';
import {ScrollView, Text, View, TextInput, StyleSheet} from 'react-native';
import {hymScreenStyles, styles} from '../styles/global.styles';
import {HymnScreenHeader} from '../components/hymnScreenHeaderCompanent';
import {HymnCard} from '../components/hymnCard';
import { colors } from '../config/colors';

export const HymScreen = ({route, navigation}) => {
  const data = route.params.data;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter hymns based on search query
  const filteredHymns = data.hyms.filter(hymn => {
    const hymnNoString = hymn.hymnNo.toString();
    const titleLower = hymn.title.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return hymnNoString.includes(searchQuery) || titleLower.includes(searchLower);
  });
  
  return (
    <View style={styles.componentsContainerStyle}>
      <HymnScreenHeader
        _goBack={() => navigation.goBack()}
        title={data.language}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={hymScreenStyles.containerStyle}>
          <View style={hymScreenStyles.titleBarStyle}>
            <Text style={hymScreenStyles.titBarTextStyle}>Hymns : {data.hyms.length}</Text>
          </View>
          
          {/* Search Bar */}
          <View style={searchStyles.searchContainer}>
            <TextInput
              style={searchStyles.searchInput}
              placeholder="Search by hymn number or title"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.fadedTextprimary}
            />
          </View>
          
          {filteredHymns.map((hymn, index) => {
            return <HymnCard key={index} _onClick={() => navigation.navigate("HymnDetails", {data: hymn})} hymn={hymn} />;
          })}
          
          {filteredHymns.length === 0 && (
            <View style={searchStyles.noResultsContainer}>
              <Text style={searchStyles.noResultsText}>No hymns found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Styles for the search functionality
const searchStyles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: colors.secondaryColor,
    borderWidth: 1,
    borderColor: colors.primaryColor,
    borderRadius: 10,
    padding: 10,
    color: colors.blackText,
    fontSize: 16,
  },
  noResultsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.primaryColor,
    fontStyle: 'italic',
  },
});
