import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, RefreshControl, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { PortcallHeader } from '../components/PortcallTimeline';
import StyledSearch from '../components/Search';
import { AuthContext } from '../context/Auth';
import { DataContext } from '../context/Data';
import { localSearchShips } from '../utils/Data';

const ActivityScreen = ({ navigation, route }) => {
  const initialSearch = (route.params && route.params.initialSearch) || null;
  const { emitter, namespace } = useContext(AuthContext);
  const { getPortcalls, pinnedVessels, pinnedVesselsIndices, portCalls /*, search*/ } = useContext(DataContext);
  const [fetchingData, setFetchingData] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const listRef = useRef();
  const { t } = useTranslation(namespace);
  //console.log('Activity: ns=', t.ns);
  const searchText = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await onRefresh();
      // Special handling of initialSearch when map is loaded for the first time
      if (initialSearch) {
        handleInitialSearch(res, initialSearch);
      }
    })();
    // TODO: if websocket events do not keep the list up to date,
    // refresh when entering screen
    /*
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh();
    });

    return unsubscribe;
    */
  }, []);

  useEffect(() => {
    handleInitialSearch(portCalls, initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (searchText.current) {
      // Update searched list if data is updated
      handleSearch(searchText.current);
    }
  }, [portCalls]);

  const handleSearch = async (text) => {
    searchText.current = text;
    setFetchingData(true);
    // await search('ship', text);
    const res = localSearchShips(text, portCalls);
    if (res) {
      setSearchResults(res);
    } else {
      setSearchResults(null);
    }
    setFetchingData(false);
  };

  const onRefresh = async () => {
    setFetchingData(true);
    const res = await getPortcalls();
    setFetchingData(false);
    return res.data && Array.isArray(res.data) ? res.data : [];
  };

  const handleInitialSearch = (vessels, text, displayDelay = 0) => {
    if (text && vessels && vessels.length) {
      const res = localSearchShips(text, vessels);
      if (res && res.length && res[0].ship) {
        setTimeout(() => {
          setActiveHeader(res[0].ship);
        }, displayDelay);
      } else {
        emitter.emit('showToast', {
          message: t('Could not find vessel'),
          duration: 2500,
          type: 'error',
        });
      }
    }
  };

  const renderHeader = ({ item, index }) => {
    return (
      <PortcallHeader
        headerStyle={styles.header}
        isPinned={Boolean(~pinnedVessels.indexOf(item.ship.imo))}
        section={item}
        namespace={namespace}
        setActiveHeader={setActiveHeader}
      />
    );
  };

  const setActiveHeader = React.useCallback(
    (ship) => {
      Keyboard.dismiss();
      navigation.navigate('Vessel', { section: { ship } });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <StyledSearch onSearch={handleSearch} t={t} />
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={searchResults ? searchResults : portCalls}
        extraData={[pinnedVessels, pinnedVesselsIndices, portCalls, searchResults]}
        //keyboardShouldPersistTaps="handled"
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
