import { useIsFocused } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { LogisticsEvent, LogisticsItemSeparator } from '../components/LogisticsTimeline';
import { AuthContext } from '../context/Auth';
import { LogisticsContext, LogisticsProvider } from '../context/Logistics';

export const Logistics = ({ navigation }) => {
  const { namespace } = useContext(AuthContext);
  const { getAllLogisticsTimestamps, logisticsTimestamps } = useContext(LogisticsContext);
  const [fetchingData, setFetchingData] = useState(false);
  const listRef = useRef();
  //console.log('Logistics: ns=', t.ns);
  const isFocused = useIsFocused();

  useEffect(() => {
    // TODO: refetching on every focus should not
    // be needed if sockets are working properly
    if (isFocused) {
      onRefresh();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setFetchingData(true);
    await getAllLogisticsTimestamps(100);
    setFetchingData(false);
    if (listRef && listRef.current) {
      listRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const renderItem = ({ item, index }) => {
    return <LogisticsEvent event={item} namespace={namespace} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={logisticsTimestamps}
        extraData={logisticsTimestamps}
        inverted
        ItemSeparatorComponent={LogisticsItemSeparator}
        keyExtractor={(item, index) => {
          return `item-${item.external_id}-${item.created_at}`;
        }}
        refreshControl={<RefreshControl refreshing={fetchingData} onRefresh={onRefresh} />}
        renderItem={renderItem}
        ref={(ref) => (listRef.current = ref)}
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
    backgroundColor: '$color_grey_lighter',
    paddingVertical: '$gap',
  },
  content: {
    flex: 1,
    backgroundColor: '$color_grey_lighter',
    paddingHorizontal: '$gap',
  },
});

Logistics.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const LogisticsScreen = (props) => {
  return (
    <LogisticsProvider>
      <Logistics {...props} />
    </LogisticsProvider>
  );
};

export default LogisticsScreen;
