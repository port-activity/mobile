import { useActionSheet } from '@expo/react-native-action-sheet';
import { useKeyboard } from '@react-native-community/hooks';
import { useIsFocused } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, Platform, useWindowDimensions, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import MapView from 'react-native-map-clustering';
import { UrlTile } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getEnvVars } from '../../environment';
import { makeMarkersFromGeojson } from '../components/GeoJson';
import {
  createMarkerIcon,
  createVesselIcon,
  SearchListItem,
  ZoomInIcon,
  ZoomInitialIcon,
  ZoomOutIcon,
} from '../components/Map';
import StyledSearch from '../components/Search';
import { AuthContext } from '../context/Auth';
import { MapContext, MapProvider } from '../context/Map';
import NavigationService from '../navigation/NavigationService';
import { HEADER_HEIGHT, TAB_BAR_HEIGHT } from '../utils/Constants';
import { localSearchMap } from '../utils/Data';

const { TILE_SERVER, TILE_TEMPLATE } = getEnvVars();
const LAST_SEARCH_ITEM_HEIGHT = 64; // 80 - padding

const Map = ({ navigation, route }) => {
  const initialSearch = (route.params && route.params.initialSearch) || null;
  const { emitter, namespace, userInfo } = useContext(AuthContext);
  const { getSeaChartMarkers, getSeaChartVessels, seaChartMarkers, seaChartVessels } = useContext(MapContext);
  const isFocused = useIsFocused();
  const mapRef = useRef();
  const keyboard = useKeyboard();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const { i18n, t } = useTranslation(namespace);
  const { showActionSheetWithOptions } = useActionSheet();

  const [cameraHeading, setCameraHeading] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({
    width: dimensions.width,
    // TODO: if dimensions are set to actually available area, the top of the map is cut of in android
    // and the bottom in ios, but the provider logos are visible
    height:
      Platform.OS === 'android'
        ? dimensions.height - insets.bottom - insets.top
        : dimensions.height - TAB_BAR_HEIGHT - HEADER_HEIGHT - insets.bottom, // - insets.top,
  });
  const [selectedFeatureId, setSelectedFeatureId] = useState(0);
  const [iconHeightMultiplier, setIconHeightMultiplier] = useState(1);

  const appliedCoordinates = userInfo.mapDefaultCoordinates ? userInfo.mapDefaultCoordinates : '61.070843,19.385103';
  const appliedZoom = userInfo.mapDefaultZoom ? parseFloat(userInfo.mapDefaultZoom) : 5;
  const appliedNearZoom = userInfo.mapDefaultNearZoom ? parseFloat(userInfo.mapDefaultNearZoom) : 0.2;
  const appliedFarZoom = userInfo.mapDefaultFarZoom ? parseFloat(userInfo.mapDefaultFarZoom) : 10;
  const [lat, long] = appliedCoordinates.split(',');
  const appliedLatitude = parseFloat(lat);
  const appliedLongitude = parseFloat(long);

  const [regionInfo, setRegionInfo] = useState({
    latitude: appliedLatitude,
    longitude: appliedLongitude,
    latitudeDelta: appliedZoom,
    longitudeDelta: appliedZoom,
  });

  const searchedFeature = useRef(null);
  const searchText = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await onRefresh();
      // Special handling of initialSearch when map is loaded for the first time
      if (initialSearch) {
        handleInitialSearch(res, initialSearch);
      }
    })();
  }, []);

  useEffect(() => {
    if (isFocused) {
      onRefresh();
    }
  }, [isFocused]);

  useEffect(() => {
    handleInitialSearch([...seaChartVessels, ...seaChartMarkers], initialSearch, 1000);
  }, [initialSearch]);

  useEffect(() => {
    if (/*searching &&*/ searchText.current) {
      // Update searched list if data is updated
      handleSearch(searchText.current);
    }
  }, [seaChartMarkers, seaChartVessels]);

  const onRefresh = async () => {
    //setFetchingData(true);
    const vessels = await getSeaChartVessels();
    const markers = await getSeaChartMarkers();
    //setFetchingData(false);
    const vesselsData = vessels.data && Array.isArray(vessels.data) ? vessels.data : [];
    const markersData = markers.data && Array.isArray(markers.data) ? markers.data : [];
    return [...vesselsData, ...markersData];
  };

  const handleInitialSearch = (features, text, displayDelay = 0) => {
    if (text && features && features.length) {
      const res = localSearchMap(text, features);
      if (res && res.length) {
        setTimeout(() => {
          selectSearchedFeature(res[0]);
        }, displayDelay);
      } else {
        emitter.emit('showToast', {
          message: t('Could not find vessel / marker on the map'),
          duration: 2500,
          type: 'error',
        });
      }
    }
  };

  const updateCameraHeading = (region) => {
    const map = mapRef.current;
    map.getCamera().then((info: Camera) => {
      setCameraHeading(info.heading);
    });
    //console.log(region.latitudeDelta);
    setRegionInfo(region);
    if (region.latitudeDelta > 3) {
      if (iconHeightMultiplier !== 0.5) {
        setIconHeightMultiplier(0.5);
      }
    } else if (region.latitudeDelta < 0.003) {
      if (iconHeightMultiplier !== 2) {
        setIconHeightMultiplier(2);
      }
    } else {
      if (iconHeightMultiplier !== 1) {
        setIconHeightMultiplier(1);
      }
    }
    if (searchedFeature.current) {
      const currentFeature = [...seaChartVessels, ...seaChartMarkers].find(
        (feature) => feature.properties.id === searchedFeature.current
      );
      setTimeout(() => {
        if (currentFeature && currentFeature.ref && typeof currentFeature.ref.showCallout === 'function') {
          currentFeature.ref.showCallout();
        }
        searchedFeature.current = 0;
      }, 500);
    }
  };

  const handleSearch = (text) => {
    //setFetchingData(true);
    searchText.current = text;
    const res = localSearchMap(text, [...seaChartVessels, ...seaChartMarkers]);
    if (res && res.length) {
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
    //setFetchingData(false);
  };

  const onFeatureSelect = (event, feature) => {
    if (feature && feature.properties) {
      setSelectedFeatureId(feature.properties.id);
      setTimeout(() => {
        if (feature.ref && typeof feature.ref.showCallout === 'function') {
          feature.ref.showCallout();
        }
      }, 0);
    }
  };

  const onPolygonPolylineSelect = (event, feature) => {
    if (feature && feature.properties) {
      setSelectedFeatureId(feature.properties.id);
      setTimeout(() => {
        if (feature.ref && typeof feature.ref.showCallout === 'function') {
          feature.ref.showCallout();
        }
      }, 250);
    }
  };

  const onCalloutPress = (event, feature) => {
    const options = [t('Show vessel timeline'), t('Cancel')];
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: t('Select action'),
        autoFocus: true,
        tintColor: '#4990DD',
        useModal: true,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          const searchString = (feature.properties && (feature.properties.imo || feature.properties.name)) || null;
          if (searchString) {
            NavigationService.navigate('ActivityStack', {
              screen: 'Activity',
              params: { initialSearch: `${searchString}` },
            });
          }
        }
      }
    );
  };

  const createMarkers = () => {
    if (seaChartMarkers) {
      return makeMarkersFromGeojson({
        geojson: {
          id: 'markers-layer',
          type: 'FeatureCollection',
          features: seaChartMarkers,
        },
        strokeColor: 'rgb(0, 0, 0)',
        fillColor: 'rgba(143, 140, 140, 0.3)',
        strokeWidth: 2,
        tracksViewChanges: false,
        onPolygonPolylinePress: onPolygonPolylineSelect,
        zIndex: 1,
        children: ({ feature }) => createMarkerIcon(feature, iconHeightMultiplier, namespace, selectedFeatureId),
      });
    }
  };

  const createClusteredVessels = () => {
    if (seaChartVessels) {
      return makeMarkersFromGeojson({
        geojson: {
          id: 'vessels-layer',
          type: 'FeatureCollection',
          features: seaChartVessels,
        },
        // TODO: tracksViewChanges needs to be set in android,
        // otherwise icon directions are not updated when rotating,
        // but currently it kills the performance in older devices
        tracksViewChanges: Platform.OS === 'android',
        //tracksViewChanges: false,
        onPress: Platform.OS === 'android' ? onFeatureSelect : undefined,
        onCalloutPress,
        zIndex: 1,
        children: ({ feature }) =>
          createVesselIcon(feature, cameraHeading, iconHeightMultiplier, i18n.language, namespace, selectedFeatureId),
      });
    }
  };

  const renderSearchItem = ({ item, index }) => {
    return <SearchListItem feature={item} namespace={namespace} selectItem={selectSearchedFeature} />;
  };

  const selectSearchedFeature = useCallback(
    (feature) => {
      setSearching(false);
      Keyboard.dismiss();
      setSelectedFeatureId(feature.properties.id);

      if (feature.geometry) {
        let latitude = 0;
        let longitude = 0;
        let zoom = 0;
        if (
          feature.geometry.type === 'Polygon' &&
          feature.geometry.coordinates[0] &&
          feature.geometry.coordinates[0][0]
        ) {
          latitude =
            typeof feature.geometry.coordinates[0][0][1] == 'string'
              ? parseFloat(feature.geometry.coordinates[0][0][1])
              : feature.geometry.coordinates[0][0][1];
          longitude =
            typeof feature.geometry.coordinates[0][0][0] == 'string'
              ? parseFloat(feature.geometry.coordinates[0][0][0])
              : feature.geometry.coordinates[0][0][0];
          zoom = 0.5;
        } else if (feature.geometry.type === 'LineString' && feature.geometry.coordinates[0]) {
          latitude =
            typeof feature.geometry.coordinates[0][1] == 'string'
              ? parseFloat(feature.geometry.coordinates[0][1])
              : feature.geometry.coordinates[0][1];
          longitude =
            typeof feature.geometry.coordinates[0][0] == 'string'
              ? parseFloat(feature.geometry.coordinates[0][0])
              : feature.geometry.coordinates[0][0];
          zoom = 0.2;
        } else {
          latitude =
            typeof feature.geometry.coordinates[1] == 'string'
              ? parseFloat(feature.geometry.coordinates[1])
              : feature.geometry.coordinates[1];
          longitude =
            typeof feature.geometry.coordinates[0] == 'string'
              ? parseFloat(feature.geometry.coordinates[0])
              : feature.geometry.coordinates[0];
          zoom = 0.005;
        }

        if (mapRef && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: zoom,
            longitudeDelta: zoom,
          });
        }

        if (feature.ref && typeof feature.ref.showCallout === 'function') {
          feature.ref.showCallout();
          searchedFeature.current = 0;
        } else {
          searchedFeature.current = feature.properties.id;
        }
      }
    },
    [mapRef, seaChartVessels, seaChartMarkers, searchedFeature.current]
  );

  const renderSearchView = () => {
    return (
      <View
        style={[
          styles.searchView,
          searching
            ? {
                maxHeight: dimensions.height - keyboard.keyboardHeight - insets.bottom - LAST_SEARCH_ITEM_HEIGHT,
              }
            : null,
        ]}>
        <StyledSearch
          containerStyle={searching ? styles.searchingContainer : styles.searchContainer}
          onEndEditing={() => setSearching(false)}
          onFocus={() => setSearching(true)}
          onSearch={handleSearch}
          t={t}
        />
        {searching ? (
          <FlatList
            contentContainerStyle={searching ? styles.searchListContentContainer : { display: 'none' }}
            data={searchResults}
            extraData={[searchResults]}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => {
              return `item-${item.properties.id}`;
            }}
            removeClippedSubviews={false}
            renderItem={renderSearchItem}
            style={styles.searchListContent}
          />
        ) : null}
      </View>
    );
  };

  const onZoomInitial = useCallback(
    () =>
      mapRef.current.animateToRegion({
        latitude: appliedLatitude,
        longitude: appliedLongitude,
        latitudeDelta: appliedZoom,
        longitudeDelta: appliedZoom,
      }),
    [mapRef, appliedLatitude, appliedLongitude, appliedZoom]
  );

  return isFocused ? (
    <View style={styles.container}>
      <MapView
        mapPadding={{
          top: Platform.OS === 'android' ? 54 : 66,
          right: Platform.OS === 'android' ? 4 : 16,
          bottom: 0,
          left: Platform.OS === 'android' ? 4 : 16,
        }}
        initialRegion={{
          latitude: appliedLatitude,
          longitude: appliedLongitude,
          latitudeDelta: appliedZoom,
          longitudeDelta: appliedZoom,
        }}
        clusterColor="#4990DD"
        loadingEnabled={false}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        style={{
          //flex: 1,
          width: mapDimensions.width,
          height: mapDimensions.height,
        }}
        ref={mapRef}
        onMapReady={() => {
          if (Platform.OS === 'android') {
            // Due to bug(?) in android the dimensions must be adjusted,
            // otherwise mapPadding will not work
            setMapDimensions({
              width: mapDimensions.width,
              height: mapDimensions.height - 1,
            });
          }
        }}
        onRegionChangeComplete={(region) => updateCameraHeading(region)}
        //onRegionChange={(region) => setRegionInfo(region)}
        onTouchStart={() => {
          Keyboard.dismiss();
          setSearching(false);
        }}
        legalLabelInsets={{
          top: 0,
          right: 0,
          bottom: -20,
          left: 0,
        }}>
        <UrlTile urlTemplate={TILE_SERVER + TILE_TEMPLATE} maximumZ={19} flipY={false} />
        {createMarkers()}
        {createClusteredVessels()}
      </MapView>
      {renderSearchView()}
      <ZoomInIcon
        onPress={() => {
          mapRef.current.animateToRegion({
            latitude: regionInfo.latitude,
            longitude: regionInfo.longitude,
            latitudeDelta: appliedNearZoom,
            longitudeDelta: appliedNearZoom,
          });
        }}
        containerStyle={styles.zoomInStyle}
      />
      <ZoomOutIcon
        onPress={() => {
          mapRef.current.animateToRegion({
            latitude: regionInfo.latitude,
            longitude: regionInfo.longitude,
            latitudeDelta: appliedFarZoom,
            longitudeDelta: appliedFarZoom,
          });
        }}
        containerStyle={styles.zoomOutStyle}
      />
      <ZoomInitialIcon onPress={onZoomInitial} containerStyle={styles.zoomInitialStyle} />
    </View>
  ) : (
    <View style={styles.container} />
  );
};

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$color_grey_lighter',
    flex: 1,
  },
  searchView: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    width: '100%',
    flexGrow: 1,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderBottomWidth: 0,
  },
  searchingContainer: {
    backgroundColor: '$color_grey_lighter',
    borderBottomColor: '$color_grey_light',
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  searchListContentContainer: {
    flexGrow: 1,
  },
  searchListContent: {
    backgroundColor: '$color_grey_lighter',
  },
  zoomInitialStyle: {
    bottom: '$gap',
    right: '$gap',
  },
  zoomOutStyle: {
    bottom: '4 * $gap',
    right: '$gap',
  },
  zoomInStyle: {
    bottom: '7 * $gap',
    right: '$gap',
  },
});

Map.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const MapScreen = (props) => {
  return (
    <MapProvider>
      <Map {...props} />
    </MapProvider>
  );
};

export default MapScreen;
