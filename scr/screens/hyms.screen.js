import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList, Text, View, TextInput, StyleSheet} from 'react-native';
import {hymScreenStyles, styles} from '../styles/global.styles';
import {HymnScreenHeader} from '../components/hymnScreenHeaderCompanent';
import {HymnCard} from '../components/hymnCard';
import { colors } from '../config/colors';

const fold = value =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const hymnOrder = hymnNo => {
  const match = String(hymnNo ?? '').trim().match(/^(\d+)(.*)$/i);
  if (!match) {
    return [Number.MAX_SAFE_INTEGER, String(hymnNo ?? '')];
  }
  return [Number(match[1]), match[2].toLowerCase()];
};

const compareHymns = (left, right) => {
  const [leftNumber, leftSuffix] = hymnOrder(left.hymnNo);
  const [rightNumber, rightSuffix] = hymnOrder(right.hymnNo);
  if (leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }
  if (leftSuffix === rightSuffix) {
    return 0;
  }
  return leftSuffix < rightSuffix ? -1 : 1;
};

const lyricText = hymn => {
  const lines = [];
  if (Array.isArray(hymn.chorus)) {
    lines.push(...hymn.chorus);
  }
  (hymn.stanzers || []).forEach(stanza => {
    if (Array.isArray(stanza.lines)) {
      lines.push(...stanza.lines);
    }
  });
  return fold(lines.join(' '));
};

const matchRank = (hymn, rawQuery, foldedQuery) => {
  const hymnId = String(hymn.hymnNo ?? '');
  const title = fold(hymn.title);
  if (/^\d+$/.test(rawQuery)) {
    const match = hymnId.match(/^(\d+)(.*)$/);
    if (!match || match[2]) {
      return -1;
    }
    if (match[1] === rawQuery) {
      return 0;
    }
    if (match[1].startsWith(rawQuery)) {
      return 1;
    }
    return -1;
  }
  if (hymnId.toLowerCase() === rawQuery.toLowerCase()) {
    return 0;
  }
  if (title.startsWith(foldedQuery)) {
    return 2;
  }
  if (title.includes(foldedQuery)) {
    return 3;
  }
  if (foldedQuery.length >= 4 && lyricText(hymn).includes(foldedQuery)) {
    return 4;
  }
  return -1;
};

export const HymScreen = ({route, navigation}) => {
  const data = route.params.data;
  const listRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hymns = useMemo(
    () => [...(data?.hyms || [])].sort(compareHymns),
    [data?.hyms],
  );

  const filteredHymns = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const foldedQuery = fold(rawQuery);
    if (!rawQuery || !foldedQuery) {
      return hymns;
    }
    return hymns
      .map(hymn => ({hymn, rank: matchRank(hymn, rawQuery, foldedQuery)}))
      .filter(item => item.rank >= 0)
      .sort((left, right) => left.rank - right.rank || compareHymns(left.hymn, right.hymn))
      .map(item => item.hymn);
  }, [hymns, searchQuery]);

  const onSearch = useCallback(text => {
    setSearchQuery(text);
    listRef.current?.scrollToOffset({offset: 0, animated: false});
  }, []);

  const handleOpenHymn = useCallback(
    hymn => {
      navigation.navigate('HymnDetails', {data: hymn});
    },
    [navigation],
  );

  const renderHymn = useCallback(
    ({item}) => <HymnCard hymn={item} _onClick={() => handleOpenHymn(item)} />,
    [handleOpenHymn],
  );

  const keyExtractor = useCallback(item => String(item.hymnNo), []);
  
  return (
    <View style={styles.componentsContainerStyle}>
      <HymnScreenHeader
        _goBack={() => navigation.goBack()}
        title={data.language}
      />
      <View style={hymScreenStyles.containerStyle}>
        <View style={hymScreenStyles.titleBarStyle}>
          <Text style={hymScreenStyles.titBarTextStyle}>
            {searchQuery.trim()
              ? `Found : ${filteredHymns.length}`
              : `Hymns : ${hymns.length}`}
          </Text>
        </View>
        
        {/* Search Bar - Now outside ScrollView to remain static */}
        <View style={searchStyles.searchContainer}>
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Search number, title, or lyrics"
            value={searchQuery}
            onChangeText={onSearch}
            autoCorrect={false}
            autoCapitalize="none"
            placeholderTextColor={colors.fadedTextprimary}
          />
        </View>

        <FlatList
          ref={listRef}
          data={filteredHymns}
          renderItem={renderHymn}
          keyExtractor={keyExtractor}
          style={{width: '100%'}}
          contentContainerStyle={searchStyles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={16}
          maxToRenderPerBatch={12}
          windowSize={8}
          updateCellsBatchingPeriod={50}
          ListEmptyComponent={
            <View style={searchStyles.noResultsContainer}>
              <Text style={searchStyles.noResultsText}>No hymns found</Text>
            </View>
          }
        />
      </View>
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.primaryColor,
    fontStyle: 'italic',
  },
});
