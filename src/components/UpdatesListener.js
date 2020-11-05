import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Popover, { Rect } from 'react-native-popover-view';
import { useSafeArea } from 'react-native-safe-area-context';

import { AuthContext } from '../context/Auth';
import { TAB_BAR_HEIGHT } from '../utils/Constants';

const UPDATE_INTERVAL = 600000; // 10 minutes

const UpdatesListener = () => {
  const { namespace } = useContext(AuthContext);
  const { i18n } = useTranslation(namespace);
  // useTranslation does not change namespace (and t) properly here
  // for already loaded namespaces, so get t from i18n
  const t = i18n.getFixedT(i18n.language, namespace);
  const [shouldFetch, setShouldFetch] = useState(!!Constants.manifest.releaseChannel);
  const [popupVisible, setPopupVisible] = useState(false);

  const insets = useSafeArea();
  const yPosition = Math.round(Dimensions.get('window').height) - (TAB_BAR_HEIGHT + 8 + insets.bottom);
  const xPosition = 0;

  useEffect(() => {
    const updateTimer = setInterval(async () => {
      if (shouldFetch) {
        const res = await Updates.checkForUpdateAsync();
        if (res && res.isAvailable) {
          const fetchRes = await Updates.fetchUpdateAsync();
          if (fetchRes && fetchRes.isNew) {
            setShouldFetch(false);
            // Show update dialog
            setPopupVisible(true);
          }
        }
      }
    }, UPDATE_INTERVAL);

    return () => {
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
    };
  }, []);

  const updateJsContent = () => {
    setPopupVisible(false);
    Updates.reloadAsync();
  };

  return (
    <Popover
      arrowStyle={{ backgroundColor: 'transparent' }}
      isVisible={popupVisible}
      fromRect={new Rect(xPosition, yPosition, 1, 1)}
      mode="tooltip"
      placement="top"
      popoverStyle={styles.updateDialog}>
      <TouchableOpacity style={styles.info} onPress={updateJsContent}>
        <Text style={styles.dialogText}>{t('A new update is available. Press here to refresh')}</Text>
      </TouchableOpacity>
    </Popover>
  );
};

const styles = EStyleSheet.create({
  updateDialog: {
    padding: '$gap',
    backgroundColor: '$color_white',
    width: '100%',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '$color_tertiary',
    borderBottomColor: '$color_tertiary',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogText: {
    alignSelf: 'center',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
  },
});

export default UpdatesListener;
