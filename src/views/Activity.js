import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { PortcallHeader } from '../components/PortcallTimeline';
import StyledSearch from '../components/Search';
import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';

const ActivityScreen = ({ navigation }) => {
  const { namespace } = useContext(AuthContext);
  const { getPortcalls, pinnedVessels, pinnedVesselsIndices, portCalls, search } = useContext(DataContext);
  const [fetchingData, setFetchingData] = useState(false);
  const listRef = useRef();
  const { t } = useTranslation(namespace);
  //console.log('Activity: ns=', t.ns);

  useEffect(() => {
    onRefresh();
  }, []);

  const handleSearch = async (text) => {
    setFetchingData(true);
    await search('ship', text);
    setFetchingData(false);
  };

  const onRefresh = async () => {
    setFetchingData(true);
    await getPortcalls();
    setFetchingData(false);
  };

  const renderHeader = ({ item, index }) => {
    return (
      <PortcallHeader
        headerStyle={styles.header}
        isPinned={Boolean(~pinnedVessels.indexOf(item.ship.imo))}
        section={item}
        t={t}
        setActiveHeader={setActiveHeader}
      />
    );
  };

  const setActiveHeader = (ship) => {
    navigation.navigate('Vessel', { section: { ship } });
  };

  return (
    <View style={styles.container}>
      <StyledSearch onSearch={handleSearch} t={t} />
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={portCalls}
        extraData={[pinnedVessels, pinnedVesselsIndices, portCalls]}
        keyExtractor={(item, index) => {
          return `item-${item.ship.id}`;
        }}
        ref={(ref) => (listRef.current = ref)}
        refreshControl={<RefreshControl refreshing={fetchingData} onRefresh={onRefresh} />}
        removeClippedSubviews={false}
        renderItem={renderHeader}
        stickyHeaderIndices={pinnedVesselsIndices}
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
});

ActivityScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ActivityScreen;
