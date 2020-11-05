import * as Localization from 'expo-localization';
import i18n from 'i18next';
import Fetch from 'i18next-fetch-backend';
import moment from 'moment';
import { initReactI18next } from 'react-i18next';
import { AsyncStorage } from 'react-native';
import 'moment/min/locales';
import * as Sentry from 'sentry-expo';

import { getEnvVars } from './environment';
//import resources from './assets/languages';

const { PRELOAD_NAMESPACES, SUPPORTED_LANGUAGES, TRANSLATIONS_API_ENDPOINT, TRANSLATIONS_API_KEY } = getEnvVars();

// Initialize language with user locale
const detectUserLanguage = (callback) => {
  return Localization.getLocalizationAsync().then((lng) => {
    if (lng && lng.locale) {
      // Init moment locale also
      moment.locale(fallbackLocale(lng.locale));
      callback(getSupportedLanguage(lng.locale.replace('_', '-')));
    }
  });
};

const fallbackLocale = (locale) => {
  if (locale) {
    // TODO: loccale support of moment is broken: https://github.com/moment/moment/issues/3624
    /*
    if (~moment.locales().indexOf(locale.toLowerCase())) {
      return locale;
    } else {*/
    const languageCode = locale.indexOf('-') === -1 ? locale : locale.substr(0, locale.indexOf('-'));
    switch (languageCode.toLowerCase()) {
      case 'zh':
        // No 'zh' locale exists in MomentJS. App will crash in production if used.
        return 'zh-cn';
      case 'pa':
        return 'pa-in';
      case 'hy':
        return 'hy-am';
      default:
        return languageCode.toLowerCase();
    }
    //}
  }
  return locale;
};

const getSupportedLanguage = (locale) => {
  if (locale) {
    // Currently only language is used
    const lang = locale.replace(/[-_][a-z]+$/i, '');
    if (~SUPPORTED_LANGUAGES.indexOf(lang)) {
      return lang;
    }
  }
  return 'en';
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback) => {
    try {
      // Init moment locale also
      moment.locale(fallbackLocale(Localization.locale));
      const language = await AsyncStorage.getItem('userLanguage');
      if (language) {
        return callback(getSupportedLanguage(language));
      }
      return detectUserLanguage(callback);
    } catch (error) {
      Sentry.captureException(error);
      detectUserLanguage(callback);
    }
  },
  cacheUserLanguage: (language) => {
    try {
      AsyncStorage.setItem('userLanguage', language);
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
    }
  },
};

const backendOptions = {
  // path where resources get loaded from, or a function
  // returning a path:
  // function(lngs, namespaces) { return customPath; }
  // the returned path will interpolate lng, ns if provided like giving a static path
  loadPath: TRANSLATIONS_API_ENDPOINT + '/translations/{{ns}}/{{lng}}',

  // path to post missing resources
  addPath: TRANSLATIONS_API_ENDPOINT + '/translation/{{ns}}/{{lng}}',

  // your backend server supports multiloading
  // /locales/resources.json?lng=de+en&ns=ns1+ns2
  // Adapter is needed to enable MultiLoading https://github.com/i18next/i18next-multiload-backend-adapter
  // Returned JSON structure in this case is
  // {
  //  lang : {
  //   namespaceA: {},
  //   namespaceB: {},
  //   ...etc
  //  }
  // }
  allowMultiLoading: false, // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading

  // define how to stringify the data when adding missing resources
  stringify: (payload) => {
    return JSON.stringify({
      missing: payload,
    });
  },
};

if (TRANSLATIONS_API_KEY) {
  backendOptions.requestOptions = {
    headers: {
      Authorization: `ApiKey ${TRANSLATIONS_API_KEY}`,
    },
  };
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(languageDetector)
  .use(Fetch)
  .init({
    backend: backendOptions,
    //debug: true,
    //resources,
    //lng: 'en', // override language detection
    //fallbackLng: 'en',
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      //bindI18n: 'initialized languageChanged loaded',
      useSuspense: true, // use if translations are fetched from backend
      //wait: true,
    },
    ns: PRELOAD_NAMESPACES, // Set to 'common' to load namespace(s) only when required
    defaultNS: 'common',
    nsMode: 'fallback',
    nsSeparator: false,
    preload: SUPPORTED_LANGUAGES,
    load: 'languageOnly',
    saveMissing: Boolean(TRANSLATIONS_API_KEY), // send not translated keys to endpoint
    saveMissingTo: 'current',
    //partialBundledLanguages: true,
  });

export default i18n;
