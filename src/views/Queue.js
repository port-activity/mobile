import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { SlotItem } from '../components/SlotItem';
import { AuthContext } from '../context/Auth';
import { QueueContext, QueueProvider } from '../context/Queue';

const Queue = ({ navigation }) => {
  const { namespace } = useContext(AuthContext);
  const { getSlotReservations, slotReservations } = useContext(QueueContext);
  const [fetchingData, setFetchingData] = useState(false);
  const listRef = useRef();
  const { t } = useTranslation(namespace);
  //console.log('Activity: ns=', t.ns);

  const renderHeader = ({ item, index }) => {
    return <SlotItem headerStyle={styles.header} item={item} index={index} namespace={namespace} />;
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = async () => {
    setFetchingData(true);
    await getSlotReservations();
    setFetchingData(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.infoHeader}>{t('Queue - Just-In-Time Arrival')}</Text>
        <Text style={styles.infoHeaderText}>{t('queue-regulations')}</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={slotReservations}
        keyExtractor={(item, index) => {
          return `item-${item.imo}`;
        }}
        ref={(ref) => (listRef.current = ref)}
        refreshControl={<RefreshControl refreshing={fetchingData} onRefresh={onRefresh} />}
        removeClippedSubviews={false}
        renderItem={renderHeader}
        style={styles.content}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$color_grey_lighter',
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    backgroundColor: '$color_grey_lighter',
  },
  header: {
    flexGrow: 1,
  },
  info: {
    backgroundColor: '$color_highlight',
    color: 'yellow',
    padding: '$gap',
  },
  infoHeader: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
  },
  infoHeaderText: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontSize: '$font_size_small',
  },
});

Queue.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const QueueScreen = (props) => {
  return (
    <QueueProvider>
      <Queue {...props} />
    </QueueProvider>
  );
};

export default QueueScreen;
