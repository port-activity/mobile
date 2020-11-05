import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SectionList, Switch, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { getEnvironmentDescription, jsVersion } from '../../environment';
import { registerPushToken } from '../api/Auth';
import StyledButton from '../components/Button';
import { ProcessingAwareView } from '../components/ProcessingAwareView';
import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';
import { getPortName } from '../utils/Helpers';

const ProfileScreen = () => {
  const { disableVibration, logOut, namespace, setDisableVibration, userInfo } = useContext(AuthContext);
  const { clearPinnedVessels, getVessels, pinnedVessels, vessels } = useContext(DataContext);
  const { t } = useTranslation(namespace);
  //console.log('Profile: ns=', t.ns);
  const [notificationsStatus, setNotificationsStatus] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getNotificationPermissions();
    getVessels();
  }, []);

  const getNotificationPermissions = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    setNotificationsStatus(existingStatus);
  };

  const renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} />;
  };

  const renderItem = ({ item }) => {
    return (
      <SectionContent containerStyles={item.extra ? styles.containerExtra : null}>
        <Text style={styles.sectionContentText}>{item.value}</Text>
        {item.extra}
      </SectionContent>
    );
  };

  const handleClearImos = async () => {
    setProcessing(true);
    await clearPinnedVessels();
    setProcessing(false);
  };

  const handleLogout = async () => {
    setProcessing(true);
    if (userInfo && userInfo.sessionId) {
      await registerPushToken(userInfo.sessionId, '');
    }
    logOut();
  };

  const portName = getPortName(namespace);
  const { manifest = {} } = Constants;
  const dev = !manifest.releaseChannel;
  const sections = [
    { data: [{ value: manifest.version }], title: 'Version' },
    { data: [{ value: Constants.nativeBuildVersion }], title: 'Native build version' },
    { data: [{ value: manifest.revisionId }], title: 'Revision' },
    { data: [{ value: jsVersion }], title: 'JS version' },
    { data: [{ value: manifest.sdkVersion }], title: 'Expo SDK version' },
    ...(dev ? [{ data: [{ value: manifest.privacy }], title: 'Privacy' }] : []),
    ...(dev ? [{ data: [{ value: manifest.orientation }], title: 'Orientation' }] : []),
    ...(dev && Platform.OS === 'ios'
      ? [
          {
            data: [
              {
                value: manifest.ios && manifest.ios.supportsTablet ? 'true' : 'false',
              },
            ],
            title: 'Tablet support',
          },
        ]
      : []),
    { data: [{ value: getEnvironmentDescription() }], title: 'Environment' },
    {
      data: [
        {
          value: t('Disable vibration for notifications and errors on this device'),
          extra: (
            <View style={styles.rightImageContainer}>
              <Switch
                value={disableVibration}
                onValueChange={(v) => setDisableVibration(v)}
                thumbColor={Platform.OS === 'android' && '#ffffff'}
                trackColor={{ true: '#4990DD' }}
              />
            </View>
          ),
        },
      ],
      title: t('Settings'),
    },
    {
      data: [
        {
          value: pinnedVessels
            .map((item) => {
              let entry = `# ${JSON.stringify(item)} (name not available)`;
              if (vessels && vessels.data) {
                const vessel = vessels.data.find((vessel) => vessel.imo === item);
                if (vessel && vessel.vessel_name) {
                  entry = `${vessel.vessel_name} (# ${item})`;
                }
              }
              return entry;
            })
            .join('\n'),
          extra: (
            <View style={styles.rightImageContainer}>
              <StyledButton
                onPress={handleClearImos}
                title={t('Clear')}
                buttonStyle={!pinnedVessels.length ? styles.disabled : null}
                disabled={Boolean(!pinnedVessels.length) || processing}
              />
            </View>
          ),
        },
      ],
      title:
        notificationsStatus === 'granted' ? (
          <>
            <Text style={styles.notificationTitle}>{t('Push Notifications\n\n')}</Text>
            <Text style={styles.notificationText}>
              {t(
                'You will receive push notifications when application ' +
                  'is backgrounded from all port messages, and also ship ' +
                  'messages and portcall changes from the following pinned vessels'
              )}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.notificationTitle}>{t('Push Notifications\n\n')}</Text>
            <Text style={styles.notificationText}>
              {t(
                "If you enable push notifications from the device's settings, " +
                  'you will receive push notifications when application is backgrounded ' +
                  'from all port messages, and also ship messages and portcall changes ' +
                  'from the following pinned vessels'
              )}
            </Text>
          </>
        ),
    },
    {
      data: [
        {
          value: `${userInfo.firstName} ${userInfo.lastName} (${userInfo.email})`,
          extra: (
            <View style={styles.rightImageContainer}>
              <StyledButton
                disabled={processing}
                onPress={() => handleLogout()}
                title={t('Logout')}
                buttonStyle={styles.cancel}
              />
            </View>
          ),
        },
      ],
      title: t('Logged in to port of {{port}} as {{role}}', { port: portName, role: userInfo.role }),
    },
  ];

  return (
    <ProcessingAwareView processing={processing} style={styles.container}>
      <SectionList
        extraData={[processing, pinnedVessels, disableVibration]}
        style={styles.container}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        keyExtractor={(item, index) => index}
        ListHeaderComponent={ListHeader}
        sections={sections}
      />
    </ProcessingAwareView>
  );
};

const ListHeader = () => {
  const { manifest } = Constants;

  return (
    <View style={styles.titleContainer}>
      <Text style={styles.nameText} numberOfLines={1}>
        {manifest.name}
      </Text>
      <Text style={styles.slugText} numberOfLines={1}>
        {manifest.slug}
      </Text>
      <Text style={styles.descriptionText}>{manifest.description || 'Description not available'}</Text>
    </View>
  );
};

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
};

const SectionContent = (props) => {
  return <View style={[styles.sectionContentContainer, props.containerStyles]}>{props.children}</View>;
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$color_white',
  },
  titleContainer: {
    padding: '$gap',
  },
  sectionHeaderContainer: {
    paddingHorizontal: '$gap',
  },
  sectionHeaderText: {
    fontSize: '$font_size_normal',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionContentContainer: {
    paddingHorizontal: '$gap',
    marginTop: '$gap_tiny',
    marginBottom: '$gap',
  },
  sectionContentText: {
    color: '$color_grey',
    fontSize: '$font_size_normal',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  nameText: {
    fontWeight: 'bold',
    fontSize: '$font_size_big',
  },
  slugText: {
    color: '$color_grey_dark',
    fontSize: '$font_size_normal',
    backgroundColor: 'transparent',
    paddingVertical: '$gap_tinier',
  },
  descriptionText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    fontSize: '$font_size_normal',
    color: '$color_grey',
  },
  containerExtra: {
    flexDirection: 'row',
    alignContent: 'space-between',
    flex: 1,
    alignItems: 'center',
  },
  rightImageContainer: {
    justifyContent: 'center',
    paddingVertical: '$gap_small',
    paddingHorizontal: '$gap',
  },
  logout: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
  },
  disabled: {
    backgroundColor: '$color_grey',
  },
  notificationText: {
    fontWeight: 'normal',
    textTransform: 'none',
    color: '$color_grey',
  },
  notificationTitle: {
    fontWeight: 'bold',
    marginBottom: '$gap_small',
  },
});

export default ProfileScreen;
