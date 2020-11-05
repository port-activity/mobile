import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { PortcallHeader } from '../components/PortcallTimeline';

const ShipInformationScreen = ({ route }) => {
  const {
    params: { namespace, section },
  } = route;
  const { t } = useTranslation(namespace);
  const { ship } = section;
  // TODO: what/how to display as status
  const status = ship.status ? ship.status : 'In transit';

  return (
    <View style={styles.container}>
      <PortcallHeader section={section} t={t} />
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>{t('Ship information')}</Text>
          <Text style={styles.subtitle}>{t('IMO')}</Text>
          <Text style={styles.text}>{ship.imo}</Text>
          <Text style={styles.subtitle}>{t('Type')}</Text>
          <Text style={styles.text}>{ship.type}</Text>
          <Text style={styles.subtitle}>{t('Status')}</Text>
          <Text style={styles.text}>{status}</Text>
          <Text style={styles.subtitle}>{t('Loa')}</Text>
          <Text style={styles.text}>{ship.loa}</Text>
          <Text style={styles.subtitle}>{t('Beam')}</Text>
          <Text style={styles.text}>{ship.beam}</Text>
          <Text style={styles.subtitle}>{t('Draft')}</Text>
          <Text style={styles.text}>{ship.draft}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$color_grey_lighter',
    flex: 1,
  },
  content: {
    padding: '$gap',
  },
  title: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    textTransform: 'uppercase',
    color: '$color_black',
    marginBottom: '$gap',
  },
  subtitle: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_black',
    marginBottom: '$gap_small',
    letterSpacing: '0.025rem',
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
    color: '$color_grey_dark',
    marginBottom: '$gap',
  },
  cancel: {
    marginTop: '$gap',
    backgroundColor: '$color_error',
  },
});

ShipInformationScreen.propTypes = {
  navigation: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      section: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ShipInformationScreen;
