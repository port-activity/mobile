import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { LogisticsEvent, LogisticsItemSeparator } from '../components/LogisticsTimeline';
import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';

export const LogisticsScreen = ({ navigation }) => {
  const { namespace } = useContext(AuthContext);
  const { getAllLogisticsTimestamps, logisticsTimestamps } = useContext(DataContext);
  const [fetchingData, setFetchingData] = useState(false);
  const listRef = useRef();
  const { t } = useTranslation(namespace);
  //console.log('Logistics: ns=', t.ns);

  useEffect(() => {
    if (navigation.isFocused()) {
      onRefresh();
    }
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh();
    });

    return unsubscribe;
  }, []);

  const onRefresh = async () => {
    setFetchingData(true);
    await getAllLogisticsTimestamps(100);
    setFetchingData(false);
    if (listRef && listRef.current) {
      listRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const renderItem = ({ item, index }) => {
    return <LogisticsEvent event={item} t={t} />;
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

LogisticsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default LogisticsScreen;
