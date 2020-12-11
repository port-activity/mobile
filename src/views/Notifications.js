import { Add } from '@assets/images';
import { useIsFocused } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { NotificationsEvent } from '../components/NotificationsTimeline';
import { AuthContext } from '../context/Auth';
import { NotificationsContext } from '../context/Notifications';
import { getFilteredNotifications } from '../utils/Data';

const NotificationsScreen = ({ navigation }) => {
  const { hasPermission, isModuleEnabled, namespace } = useContext(AuthContext);
  const { getNotifications, notifications, setLatestNotification } = useContext(NotificationsContext);
  const [fetchingData, setFetchingData] = useState(false);
  const [notificationsFilter, setNotificationsFilter] = useState(isModuleEnabled('activity_module') ? null : 'port');
  const listRef = useRef();
  const { t } = useTranslation(namespace);
  //console.log('Notifications: ns=', t.ns);
  const [viewedTimestamp, setViewedTimestamp] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    // TODO: refetching on every focus should not
    // be needed if sockets are working properly
    if (isFocused) {
      onRefresh();
    }
  }, [isFocused]);

  useEffect(() => {
    setLatestNotification(viewedTimestamp);
  }, [viewedTimestamp]);

  const onRefresh = async () => {
    setFetchingData(true);
    await getNotifications(100);
    setFetchingData(false);
    if (listRef && listRef.current) {
      listRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const renderItem = ({ item, index }) => {
    return <NotificationsEvent item={item} />;
  };

  const _onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    //console.log('Visible items are', viewableItems);
    //console.log('Changed in this iteration', changed);
    // Use navigation.isFocused(), as it doesn't re-render the screen
    if (navigation.isFocused() && changed && changed.length && changed[0].isViewable && changed[0].item) {
      setViewedTimestamp(changed[0].item.created_at);
    }
  }, []);

  const data = getFilteredNotifications(notifications, notificationsFilter);
  const canSendPush = hasPermission('send_push_notification');

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={data}
        extraData={data}
        inverted
        keyExtractor={(item, index) => {
          return `item-${item.id}`;
        }}
        onViewableItemsChanged={_onViewableItemsChanged}
        refreshControl={<RefreshControl refreshing={fetchingData} onRefresh={onRefresh} />}
        renderItem={renderItem}
        ref={(ref) => (listRef.current = ref)}
        style={styles.content}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 100,
        }}
      />
      {isModuleEnabled('activity_module') ? (
        <NotificationsFilter
          notificationsFilter={notificationsFilter}
          onAll={() => setNotificationsFilter(null)}
          onPort={() => setNotificationsFilter('port')}
          onShip={() => setNotificationsFilter('ship')}
          t={t}
        />
      ) : null}
      {canSendPush ? (
        <TouchableOpacity
          style={styles.addNotificationContainer}
          onPress={() => navigation.navigate('SendGlobalNotification', { section: { ship: null }, namespace })}>
          <Add height={48} width={48} style={styles.addNotification} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const NotificationsFilter = ({ notificationsFilter, onAll, onPort, onShip, t }) => {
  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterGroup}>
        <TouchableOpacity
          style={[styles.filterButton, !notificationsFilter ? styles.activeFilterButton : null]}
          onPress={onAll}>
          <Text style={[styles.filterButtonText, !notificationsFilter ? styles.activeButtonText : null]}>
            {t('All')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, notificationsFilter === 'ship' ? styles.activeFilterButton : null]}
          onPress={onShip}>
          <Text style={[styles.filterButtonText, notificationsFilter === 'ship' ? styles.activeButtonText : null]}>
            {t('Ships')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, notificationsFilter === 'port' ? styles.activeFilterButton : null]}
          onPress={onPort}>
          <Text style={[styles.filterButtonText, notificationsFilter === 'port' ? styles.activeButtonText : null]}>
            {t('Port')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

NotificationsFilter.propTypes = {
  onAll: PropTypes.func.isRequired,
  onPort: PropTypes.func.isRequired,
  onShip: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$color_grey_lighter',
  },
  filterContainer: {
    padding: '$gap_small',
    backgroundColor: '$color_grey_lighter',
    borderTopColor: '$color_grey_light',
    borderTopWidth: 1,
    marginBottom: 0,
  },
  filterGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  filterButton: {
    borderRadius: '$border_radius',
    paddingVertical: '$gap_small',
    paddingHorizontal: '$gap_big',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_light',
    backgroundColor: '$color_white',
    flexGrow: 1,
    marginHorizontal: '$gap_small',
  },
  activeFilterButton: {
    backgroundColor: '$color_tertiary',
  },
  filterButtonText: {
    color: '$color_grey',
    textAlign: 'center',
    alignSelf: 'center',
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_normal',
    textTransform: 'uppercase',
    letterSpacing: '0.05rem',
  },
  activeButtonText: {
    color: '$color_white',
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: '$color_grey_lighter',
    paddingBottom: '$gap', // Inverted list
  },
  content: {
    backgroundColor: '$color_grey_lighter',
    paddingHorizontal: '$gap',
  },
  addNotificationContainer: {
    position: 'absolute',
    top: '$gap_big',
    right: '$gap_big',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 1,
    elevation: 2,
    shadowColor: '$color_black',
    shadowOpacity: 0.45,
  },
  addNotification: {
    height: 48,
    width: 48,
  },
});

NotificationsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default NotificationsScreen;
