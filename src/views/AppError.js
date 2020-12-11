import Images from '@assets/images';
import Constants from 'expo-constants';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Native as Sentry } from 'sentry-expo';

import { getEnvVars } from '../../environment';
import { DarkStatusBar } from '../components/StatusBar';

const { NAMESPACE } = getEnvVars();

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line handle-callback-err
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (Constants.manifest.releaseChannel) {
      Sentry.withScope((scope) => {
        scope.setExtras(errorInfo);
        Sentry.captureException(error);
      });
    } else {
      // Uncomment to send dev errors
      /*
      Sentry.withScope(scope => {
        scope.setExtras(errorInfo);
        Sentry.captureException(error);
      });
      */
    }
  }

  render() {
    const { i18n } = this.props;
    const t = i18n.getFixedT(i18n.language, NAMESPACE);

    if (this.state.hasError) {
      return (
        <View style={styles.view}>
          <DarkStatusBar />
          <Image source={Images.error1} height={80} width={80} style={styles.logo} />
          <Text style={styles.title}>{t('Oops! Something went wrong.')}</Text>
          <Text style={styles.description}>{t('Please try restarting the application')}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = EStyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: '$color_white',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: '$gap',
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: '$gap_big',
  },
  title: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    textTransform: 'uppercase',
    color: '$color_black',
    marginBottom: '$gap_smaller',
    alignSelf: 'center',
  },
  description: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    lineHeight: '$line_height',
    color: '$color_black',
    marginBottom: '$gap_smaller',
    alignSelf: 'center',
  },
});

export default withTranslation()(ErrorBoundary);
