import {StyleSheet} from 'react-native';
import {colors} from '../config/colors';

export const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
  componentsContainerStyle: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
});

export const homescreenStyles = StyleSheet.create({
  languageButton: {
    marginVertical: 10,
    borderRadius: 10,
    width: '50%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryColor,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
  },
  componentsContainerStyle: {
    flex: 2,
    marginTop: 'auto',
    backgroundColor: colors.secondaryColor,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  contentContainerStyle: {
    display: "flex",
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    width: "100%",
  },
  topViewStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '15%',
  },
  headerTextStyle: {
    color: colors.primarytextColor,
    fontWeight: 'bold',
    fontSize: 30,
  },
  smallText: {
    color: colors.fadedTextprimary,
    fontSize: 15,
  },
  poweredByStyle: {
    backgroundColor: colors.secondaryColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  poweredbyText: {
    fontSize: 13,
    color: colors.fadedTextprimary,
  },
});

export const hymScreenStyles = StyleSheet.create({
  containerStyle: {
    flex: 2,
    alignItems: 'center',
    backgroundColor: colors.secondaryColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 10,
    height: 'auto',
    paddingTop: 5,
  },
  headerComponentstyle: {
    height: '5%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.fadedTextprimary,
  },
  headerMiddleCompStyle: {
    color: colors.secondaryColor,
    fontWeight: 'bold',
    fontSize: 25,
  },
  titleBarStyle: {
    height: 50,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    display: 'flex',
    width: '100%',
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primaryColor,
  },
  titBarTextStyle: {
    fontWeight: '500',
    color: colors.primaryColor,
    fontSize: 15,
  },
});

export const langCardStyle = StyleSheet.create({
  containerStyle: {
    height: 130,
    width: 130,
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.secondaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elevation: {
    elevation: 5,
    shadowColor: '#52006A',
  },
  languageButtonText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: colors.primaryColor,
  },
});

export const hymnCardStyle = StyleSheet.create({
  containerStyle: {
    height: 100,
    width: '85%',
    marginVertical: 10,
    borderRadius: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  hymnNumberStyle: {
    borderRadius: 50,
    backgroundColor: colors.lightAccentColor,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  titleStyle: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    marginVertical: 5,
  },
  creatorTextStyle: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.blackText,
  },
  subtitleTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: colors.blackText,
  },
  creatorViewStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readhymmButtonStyle: {
    backgroundColor: colors.lightAccentColor,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export const hymnDetailsCreenStyles = StyleSheet.create({
  containerStyle: {
    flex: 2,
    backgroundColor: colors.secondaryColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 10,
    height: 'auto',
    paddingTop: 5,
  },
});

export const chorusCardStyles = StyleSheet.create({
  containerStyle: {
    minHeight: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primaryColor,
    width: '100%',
  },
  titleplaceStyle: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    height: 45,
    alignItems: 'flex-end',
    borderBottomWidth: 0.5,
  },
  hymnTitleStyle: {
    fontWeight: 'bold',
    color: colors.primaryColor,
    fontStyle: 'italic',
    fontSize: 15,
  },
  chorusTitletyle: {
    fontWeight: '400',
    marginTop: 10,
    fontStyle: 'italic',
    color: colors.blackText
  },
  noChorusText: {
    alignSelf: 'center',
    marginBottom: 2,
    fontStyle: 'italic',
    fontFamily: 'times',
    letterSpacing: 1,
    color: colors.blackText
  },
  chorusSectionStyle: {
    marginBottom: 5,
  },
  chorusSectionTextStyle: {
    letterSpacing: 1,
    fontStyle: 'italic',
    fontFamily: 'times',
    flexWrap: 'wrap',
    fontSize: 14,
    color: colors.blackText,
    lineHeight: 25
  },
});

export const stanzaCardStyles = StyleSheet.create({
  constinerStyle: {
    width: '100%',
    height: 'auto',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primaryColor,
    marginTop: 10,
    paddingBottom: 5,
    display: 'flex',
    flexDirection: 'row',
  },
  stanzaNumberStyle: {
    marginRight: 10,
    backgroundColor: colors.lightAccentColor,
    padding: 3,
    borderRadius: 100,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stanzaLineStyle: {
    letterSpacing: 1.5,
    fontFamily: 'times',
    // fontWeight: 'bold',
    marginBottom: 2,
    fontStyle: 'italic',
    color: colors.blackText,
    lineHeight: 35
  },
  textCardstyles: {display: 'flex', width: '80%'},
});
