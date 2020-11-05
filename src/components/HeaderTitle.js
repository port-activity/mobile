import { Back } from '@assets/images';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import 'moment/min/locales';
import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import NamespacedImage from '../components/NamespacedImage';
import { AuthContext } from '../context/Auth';
import { getPortName } from '../utils/Helpers';

const screenWidth = Math.round(Dimensions.get('window').width);

const HeaderTitle = ({ showBackButton }) => {
  const { namespace } = useContext(AuthContext);
  const { i18n } = useTranslation(namespace);
  const [time, setTime] = useState(moment().format('DD.MM.YYYY HH:mm ([GMT] Z)')); // TODO Use proper regional time formatting.
  // useTranslation does not change namespace (and t) properly here
  // for already loaded namespaces, so get t from i18n
  const t = i18n.getFixedT(i18n.language, namespace);
  //console.log('Activity: ns=', t.ns);
  const navigation = useNavigation();

  const portName = getPortName(namespace);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const tick = () => {
    setTime(moment().format('DD.MM.YYYY HH:mm ([GMT] Z)')); // TODO Use proper regional time formatting.
  };

  return (
    <View style={styles.view}>
      {showBackButton ? (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Back style={styles.back} />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={[styles.leftImageContainer, showBackButton ? styles.leftImageWithBackButton : null]}>
        <NamespacedImage src="LogoInverted" width={42} height={42} style={styles.logo} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.caption}>{t('Port of {{portname}}', { portname: portName })}</Text>
        <Text style={styles.currentTime}>{time}</Text>
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: screenWidth,
    height: '100%',
  },
  leftImageContainer: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: '$gap',
    paddingRight: '$gap_smaller',
  },
  leftImageWithBackButton: {
    paddingLeft: 0,
  },
  logo: {
    alignSelf: 'flex-start',
    width: 42,
    height: 42,
  },
  backButtonContainer: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: '$gap',
  },
  back: {
    alignSelf: 'flex-start',
    width: 24,
    height: 24,
    marginLeft: '$gap_tinier',
    marginRight: '$gap_small',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  caption: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_normal',
    letterSpacing: '0.05rem',
    textTransform: 'uppercase',
    color: '$color_tertiary',
  },
  currentTime: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontSize: '$font_size_normal',
    lineHeight: '$line_height',
    color: '$color_white',
  },
});

HeaderTitle.propTypes = {
  showBackButton: PropTypes.bool,
};

export default HeaderTitle;
