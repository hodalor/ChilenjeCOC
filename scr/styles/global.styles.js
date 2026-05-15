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
    fontSize: 18,
    color: colors.Textseondary,
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
    minHeight: 64,
    width: '95%',
    marginVertical: 6,
    borderRadius: 10,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  hymnNumberStyle: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    minWidth: 28,
  },
  titleStyle: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    marginBottom: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorTextStyle: {
    fontSize: 13,
    fontStyle: 'normal',
    color: '#666666',
  },
  subtitleTextStyle: {
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '500',
    color: colors.blackText,
    flex: 1,
  },
  hymnNumberTextStyle: {
    color: colors.primaryColor,
    fontWeight: 'bold',
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
    borderBottomColor: '#E0E0E0',
    width: '100%',
    paddingBottom: 10,
  },
  titleplaceStyle: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    height: 45,
    alignItems: 'flex-end',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  hymnTitleStyle: {
    fontWeight: 'bold',
    color: colors.primaryColor,
    fontStyle: 'normal',
    fontSize: 16,
  },
  chorusTitletyle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    fontStyle: 'normal',
    color: colors.primaryColor
  },
  noChorusText: {
    alignSelf: 'center',
    marginBottom: 2,
    fontStyle: 'normal',
    fontFamily: 'System',
    letterSpacing: 0.5,
    color: colors.blackText
  },
  chorusSectionStyle: {
    marginBottom: 10,
    paddingLeft: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  chorusSectionTextStyle: {
    letterSpacing: 0.5,
    fontStyle: 'normal',
    fontFamily: 'System',
    flexWrap: 'wrap',
    fontSize: 16,
    color: colors.blackText,
    lineHeight: 24,
    width: '95%',
    marginBottom: 4
  },
});

export const stanzaCardStyles = StyleSheet.create({
  constinerStyle: {
    width: '100%',
    height: 'auto',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    marginTop: 10,
    paddingBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stanzaNumberStyle: {
    marginRight: 10,
    backgroundColor: colors.primaryColor,
    padding: 3,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stanzaLineStyle: {
    letterSpacing: 0.5,
    fontFamily: 'System',
    fontSize: 19,
    marginBottom: 4,
    fontStyle: 'normal',
    color: colors.blackText,
    lineHeight: 24,
    flexShrink: 1,
    width: '98%'
  },
  textCardstyles: {
    display: 'flex', 
    marginTop: 2,
    flexDirection: 'column',
    width: '85%',
  },
});
