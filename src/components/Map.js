import { Vessel, VesselArrow, VesselFull } from '@assets/images';
import { Entypo, Foundation, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Callout } from 'react-native-maps';

//import { TIME_FORMAT } from '../utils/Constants';

export const createMarkerIcon = (feature, iconHeightMultiplier, namespace, selectedFeatureId) => {
  const style = {
    color: 'white',
    //color: 'black',
  };
  if (feature.properties) {
    if (feature.properties.color) {
      style.color = feature.properties.color;
    }
  }

  return (
    <MarkerIcon
      feature={feature}
      iconHeightMultiplier={iconHeightMultiplier}
      namespace={namespace}
      selected={selectedFeatureId === feature.properties.id}
      style={style}
    />
  );
};

// Show empty tooltip when callout is not selected for improved performance
const MarkerIcon = memo(({ feature, iconHeightMultiplier, namespace, selected, style }) => {
  const { t } = useTranslation(namespace);
  const name = (feature.properties && feature.properties.name) || 'N/A';
  const description = (feature.properties && feature.properties.description) || '';
  let icon = <Foundation name="marker" size={32 * iconHeightMultiplier} style={style} />;
  switch (feature.properties.type) {
    case 'port':
      style.color = 'yellow';
      icon = <MaterialCommunityIcons name="anchor" size={32 * iconHeightMultiplier} style={style} />;
      break;
    case 'vis-sync-point':
      //style.color = 'white';
      icon = <MaterialIcons name="sync" size={32 * iconHeightMultiplier} style={style} />;
      break;
    case 'rta-point':
    case 'berth':
    case 'anchorage':
      break;
    default:
      icon = <Entypo name="dot-single" size={1} color="transparent" />;
      break;
  }
  const fullCallouts = /*Platform.OS === 'android' ? selected :*/ true;

  return (
    <>
      {icon}
      {fullCallouts /*&& name*/ ? (
        <Callout style={styles.callout}>
          <Text style={styles.calloutTitle}>{t(name)}</Text>
          <Text style={styles.calloutContent}>{t(description)}</Text>
        </Callout>
      ) : (
        <Callout toolip style={{ display: 'none' }} />
      )}
    </>
  );
});

export const createVesselIcon = (feature, heading, iconHeightMultiplier, language, namespace, selectedFeatureId) => {
  const arrowStyle = {
    color: 'black',
  };
  const vesselStyle = {
    color: 'white',
  };
  if (feature.properties) {
    switch (feature.properties.marker_class) {
      case 'vessel_blue':
        vesselStyle.color = 'blue';
        break;
      case 'vessel_cyan':
        vesselStyle.color = 'cyan';
        break;
      case 'vessel_purple':
        vesselStyle.color = 'purple';
        break;
      case 'vessel_green':
        vesselStyle.color = 'green';
        break;
      case 'vessel_gray':
        vesselStyle.color = 'gray';
        break;
      case 'vessel_black':
        vesselStyle.color = 'black';
        break;
      case 'vessel_white':
        vesselStyle.color = 'white';
        break;
      case 'vessel_red':
        vesselStyle.color = 'red';
        break;
      case 'vessel_orange':
        vesselStyle.color = 'orange';
        break;
      default:
        vesselStyle.color = 'gray';
        break;
    }
    if (feature.properties.color) {
      vesselStyle.color = feature.properties.color;
    }
    const vesselRotationDegrees = feature.properties.heading_degrees ? feature.properties.heading_degrees : 0;
    vesselStyle['transform'] = [{ rotate: `${vesselRotationDegrees - heading}deg` }];
    if (feature.properties.course_over_ground_degrees) {
      arrowStyle['transform'] = [{ rotate: `${feature.properties.course_over_ground_degrees - heading}deg` }];
    } else {
      arrowStyle.display = 'none';
    }
  }
  // Display "last updated" in selected language
  const formattedTimestamp = moment(feature.properties.location_timestamp); //moment(feature.properties.location_timestamp).format(TIME_FORMAT);
  formattedTimestamp.locale(language);

  return (
    <VesselIcon
      arrowStyle={arrowStyle}
      feature={feature}
      iconHeightMultiplier={iconHeightMultiplier}
      namespace={namespace}
      timestamp={formattedTimestamp.fromNow()}
      selected={selectedFeatureId === feature.properties.id}
      vesselStyle={vesselStyle}
    />
  );
};

// Show empty tooltip when callout is not selected for improved performance
const VesselIcon = memo(
  ({ arrowStyle, feature, iconHeightMultiplier, namespace, selected, timestamp, vesselStyle }) => {
    const { t } = useTranslation(namespace);
    const fullCallouts = Platform.OS === 'android' ? selected : true;
    return (
      <>
        {arrowStyle && arrowStyle.display && arrowStyle.display === 'none' ? (
          <View
            style={[styles.vesselIconsView, { height: 32 * iconHeightMultiplier, width: 32 * iconHeightMultiplier }]}>
            <VesselFull height={32 * iconHeightMultiplier} style={[styles.vesselIcons, vesselStyle]} />
          </View>
        ) : (
          <View
            style={[styles.vesselIconsView, { height: 32 * iconHeightMultiplier, width: 32 * iconHeightMultiplier }]}>
            <Vessel height={32 * iconHeightMultiplier} style={[styles.vesselIcons, vesselStyle]} />
            <VesselArrow height={10 * iconHeightMultiplier} style={[styles.vesselIcons, arrowStyle]} />
          </View>
        )}
        {fullCallouts /*&& feature.properties.name*/ ? (
          <Callout style={styles.callout}>
            <Text style={styles.calloutTitle}>{feature.properties.name}</Text>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('MMSI: ')}</Text>
              <Text style={styles.calloutContentText}>{feature.properties.mmsi}</Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('IMO: ')}</Text>
              <Text style={styles.calloutContentText}>{feature.properties.imo}</Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('Latitude: ')}</Text>
              <Text style={styles.calloutContentText}>{feature.properties.latitude}</Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('Longitude: ')}</Text>
              <Text style={styles.calloutContentText}>{feature.properties.longitude}</Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('Speed (knots): ')}</Text>
              <Text style={styles.calloutContentText}>
                {feature.properties.speed_knots ? feature.properties.speed_knots : t('Not available')}
              </Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('Heading (degrees): ')}</Text>
              <Text style={styles.calloutContentText}>
                {feature.properties.heading_degrees ? feature.properties.heading_degrees : t('Not available')}
              </Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('Course over ground (degrees): ')}</Text>
              <Text style={styles.calloutContentText}>
                {feature.properties.course_over_ground_degrees
                  ? feature.properties.course_over_ground_degrees
                  : t('Not available')}
              </Text>
            </View>
            <View style={styles.calloutContent}>
              <Text style={styles.calloutContentTitle}>{t('Location last updated: ')}</Text>
              <Text style={styles.calloutContentText}>{timestamp}</Text>
            </View>
          </Callout>
        ) : (
          <Callout toolip style={{ display: 'none' }} />
        )}
      </>
    );
  }
);

export const SearchListItem = memo(({ feature, namespace, selectItem }) => {
  const { t } = useTranslation(namespace);
  const name = feature.properties.name || '';
  const description = feature.properties.description || '';
  const imo = feature.properties.imo || '';
  const mmsi = feature.properties.mmsi || '';
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => (selectItem ? selectItem(feature) : null)}
        activeOpacity={selectItem ? 0.2 : 1}>
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{name}</Text>
          </View>
          {imo || mmsi ? (
            <>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('IMO: ')}</Text>
                <Text style={styles.infoDescription}>{imo}</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('MMSI: ')}</Text>
                <Text style={styles.infoDescription}>{mmsi}</Text>
              </View>
            </>
          ) : (
            <View style={styles.infoContent}>
              <Text style={styles.infoDescription}>{description}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

export const ZoomInitialIcon = memo(({ containerStyle, onPress }) => {
  return (
    <View style={[styles.zoomView, containerStyle]}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
        <MaterialCommunityIcons name="image-filter-center-focus" size={32} style={styles.zoomIcon} />
      </TouchableOpacity>
    </View>
  );
});

export const ZoomInIcon = ({ containerStyle, onPress }) => {
  return (
    <View style={[styles.zoomView, containerStyle]}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => onPress('in')}>
        <MaterialCommunityIcons name="arrow-collapse-all" size={32} style={styles.zoomIcon} />
      </TouchableOpacity>
    </View>
  );
};

export const ZoomOutIcon = ({ containerStyle, onPress }) => {
  return (
    <View style={[styles.zoomView, containerStyle]}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => onPress('out')}>
        <MaterialCommunityIcons name="arrow-expand-all" size={32} style={styles.zoomIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$color_white',
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 2,
    elevation: 2,
    shadowColor: '$color_black',
    shadowOpacity: 0.15,
    paddingHorizontal: '$gap',
    paddingVertical: '$gap_smaller',
    borderBottomColor: '$color_grey_light',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  infoContainer: {
    flexDirection: 'column',
    flexGrow: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    textTransform: 'uppercase',
    color: '$color_grey_dark',
    marginBottom: '$gap_tinier',
  },
  infoContent: {
    flexDirection: 'row',
    marginBottom: '$gap_tiny',
  },
  infoTitle: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
  },
  infoDescription: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
  },
  callout: {
    flex: 1,
    minWidth: Dimensions.get('window').width / 2,
  },
  calloutTitle: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    color: '$color_near_black',
    marginBottom: '$gap_tiny',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  calloutContent: {
    flexDirection: 'row',
  },
  calloutContentTitle: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_near_black',
    marginBottom: '$gap_tiny',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  calloutContentText: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
    marginBottom: '$gap_tiny',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  zoomView: {
    position: 'absolute',
    flex: 1,
    bottom: '$gap',
    right: '$gap',
  },
  zoomIcon: {
    color: '$color_grey',
  },
  vesselIconsView: {
    //height: 32,
    //width: 32,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vesselIcons: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
