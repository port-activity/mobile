import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, RefreshControl, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { ActionsPopOver } from '../components/ActionsPopover';
import { PortcallHeader, PortcallEvent } from '../components/PortcallTimeline';
import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';
import NavigationService from '../navigation/NavigationService';
import { filterEventsForShip, markCurrentTimestamp } from '../utils/Data';

const TIMESTAMP_ESTIMATED_HEIGHT = Platform.OS === 'ios' ? 66.5 : 65.3; // TODO: rough estimate

const VesselScreen = ({ navigation, route }) => {
  const { hasPermission, namespace } = useContext(AuthContext);
  const { getPortcall, pinnedVessels, portCalls, timestamps, toggleShipPin } = useContext(DataContext);
  const { t } = useTranslation(namespace);
  //console.log('Vessel: ns=', t.ns);
  const [isPinning, setIsPinning] = useState(false);

  const canAddTimestamp = hasPermission('add_manual_timestamp');
  const canSendPush = hasPermission('send_push_notification');
  const canSendRta = hasPermission('send_rta_web_form');

  const [headerDotsActions] = useState([
    { action: 'pin', title: t('Pin this vessel') },
    { action: 'info', title: t('Ship information') },
    { action: 'map', title: t('Show on map') },
    ...(canAddTimestamp ? [{ action: 'add_timestamp', title: t('Add new timestamp') }] : []),
    ...(canSendPush ? [{ action: 'send_notification', title: t('Send notification') }] : []),
    ...(canSendRta ? [{ action: 'rta', title: t('Recommend time (RTA)') }] : []),
  ]);
  const [currentIndex /*, setCurrentIndex*/] = useState(0);
  const [fetchingData, setFetchingData] = useState(false);
  const [showPopOver, setShowPopOver] = useState(false);
  const [data, setData] = useState([]);

  const popOverRef = useRef();
  const listRef = useRef();

  const {
    params: { section },
  } = route;

  const [headerSection, setHeaderSection] = useState(section);

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (timestamps && timestamps.ship.imo === section.ship.imo) {
      if (timestamps.events) {
        setData(timestamps.events);
        setHeaderSection({ ship: timestamps.ship });
      }
    } else {
      // For initial render
      const shipData = filterEventsForShip({ currentIndex, portCalls, imo: section.ship.imo });
      if (shipData && shipData.events) {
        // Don't try to mark current event from past indexes
        const marked = currentIndex ? shipData.events : markCurrentTimestamp(shipData);
        setData(marked.events);
        setHeaderSection({ ship: shipData.ship });
      }
    }
  }, [currentIndex, portCalls, section, timestamps]);

  const handleAction = async (buttonIndex, ship) => {
    if (buttonIndex <= headerDotsActions.length - 1) {
      const action = headerDotsActions[buttonIndex];
      switch (action.action) {
        case 'pin': // Pin this vessel
          handlePin(ship);
          break;
        case 'info': // Ship information
          navigation.navigate('ShipInformation', { section: { ship }, namespace });
          break;
        case 'map': // Show on map
          NavigationService.navigate('MapStack', {
            screen: 'Map',
            params: { initialSearch: `${ship.imo || ship.vessel_name}` },
          });
          break;
        case 'add_timestamp': // Add new timestamp
          navigation.navigate('AddTimestamp', { section: { ship }, namespace });
          break;
        case 'send_notification': // Send notification
          navigation.navigate('SendNotification', { section: { ship }, namespace });
          break;
        case 'rta': // Recommend time (RTA)
          navigation.navigate('RecommendTime', { section: { ship }, namespace });
          break;
        default:
          break;
      }
    }
  };

  const handlePin = async (ship) => {
    if (isPinning) {
      return;
    }
    setIsPinning(true);
    await toggleShipPin(ship.imo);
    setIsPinning(false);
  };

  const onRefresh = async () => {
    const { ship } = section;

    setFetchingData(true);
    const res = await getPortcall(ship.imo, currentIndex);
    setFetchingData(false);

    if (res && res.processed && res.processed.events) {
      const scrollIndex = res.processed.events.findIndex((event) =>
        event.timestamps.find((timestamp) => timestamp.isCurrent)
      );
      //console.log('onRefresh: ', scrollIndex);
      if (scrollIndex !== -1) {
        if (Platform.OS === 'ios') {
          scrollToCurrent(scrollIndex, res.processed.events);
        } else {
          setTimeout(() => {
            scrollToCurrent(scrollIndex, res.processed.events);
          }, 100);
        }
      }
    }
  };

  const onScrollToIndexFailed = ({ index, highestMeasuredFrameIndex, averageItemLength }) => {
    //console.log('onScrollToIndexFailed: ', index, highestMeasuredFrameIndex, averageItemLength);
    if (listRef && listRef.current && averageItemLength && highestMeasuredFrameIndex) {
      listRef.current.scrollToOffset({ animated: true, offset: averageItemLength * highestMeasuredFrameIndex });
    }
    setTimeout(() => {
      if (timestamps) {
        scrollToCurrent(index, timestamps.events);
      }
    }, 100);
  };

  const scrollToCurrent = (index, events) => {
    let offset = 0;
    if (events && events[index]) {
      const totalHeight = events[index].timestamps.length * TIMESTAMP_ESTIMATED_HEIGHT;
      const subIndex = events[index].timestamps.findIndex((timestamp) => timestamp.isCurrent);
      const subHeight = subIndex > 0 ? subIndex * TIMESTAMP_ESTIMATED_HEIGHT + TIMESTAMP_ESTIMATED_HEIGHT / 2 : 0;
      offset = subHeight - totalHeight / 2;
      /*
      console.log(
        `scrollToCurrent: index=${index}, subIndex=${subIndex}, offset=${offset}, totalHeight=${totalHeight} subHeight=${subHeight}`
      );*/
    }
    if (listRef && listRef.current) {
      //console.log(`scrollToCurrent: index=${index}, offset=${offset}`);
      listRef.current.scrollToIndex({ animated: true, index, viewOffset: offset, viewPosition: 0.5 });
    }
  };

  const renderContent = (ship, event) => {
    return (
      <PortcallEvent
        id={event.id}
        isPort={event.location === 'port'}
        namespace={namespace}
        timestamps={event.timestamps}
      />
    );
  };

  const renderItem = ({ item, index }) => {
    const { ship } = section;
    return renderContent(ship, item);
  };

  return (
    <View style={styles.container}>
      <PortcallHeader
        isPinned={Boolean(~pinnedVessels.indexOf(section.ship.imo))}
        isPinning={isPinning}
        section={headerSection}
        namespace={namespace}
        onActionPress={() => setShowPopOver(true)}
        onPinPress={handlePin}
        ref={(ref) => (popOverRef.current = ref)}
      />
      <ActionsPopOver
        actions={headerDotsActions.map((option) => {
          let title = option.title;
          if (option.action === 'pin' && ~pinnedVessels.indexOf(section.ship.imo)) {
            title = t('Unpin this vessel');
          }
          return {
            contextData: section.ship,
            title,
          };
        })}
        onAction={handleAction}
        onclose={() => setShowPopOver(false)}
        placement="bottom"
        ref={popOverRef}
        show={showPopOver}
      />
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={data}
        extraData={data}
        inverted
        keyExtractor={(item, index) => {
          return `item-${item.id}`;
        }}
        onScrollToIndexFailed={onScrollToIndexFailed}
        refreshControl={
          <RefreshControl refreshing={fetchingData} onRefresh={onRefresh} tintColor="#FFFFFF" titleColor="#FFFFFF" />
        }
        renderItem={renderItem}
        ref={listRef}
        style={styles.content}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$color_primary',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: '$gap', // Inverted list
  },
  content: {
    backgroundColor: '$color_primary',
    paddingHorizontal: '$gap',
  },
});

VesselScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      section: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default VesselScreen;
