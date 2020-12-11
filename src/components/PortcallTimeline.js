import { ArrowRight, Pin, Unpin, Info } from '@assets/images';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Popover from 'react-native-popover-view';

export const PortcallEvent = memo(({ id, timestamps, isPort, namespace }) => {
  return (
    <View style={[styles.eventsContainer, isPort ? styles.portEvents : '']}>
      <View style={[styles.events, isPort ? styles.portEvents : '']}>
        {timestamps.map((timestamp, index) => {
          return (
            <PortcallTimestamp
              isPort={isPort}
              key={`${id}-${timestamp.time_type}-${timestamp.state}-${timestamp.time}-${index}`} // TODO: index added for dev version
              namespace={namespace}
              timestamp={timestamp}
            />
          );
        })}
      </View>
    </View>
  );
});

PortcallEvent.propTypes = {
  id: PropTypes.number.isRequired,
  isPort: PropTypes.bool,
  namespace: PropTypes.string.isRequired,
  timestamps: PropTypes.array.isRequired,
};

// TOOO: Evaluate if memo is unnecessary
export const PortcallTimestamp = memo(({ isPort, namespace, timestamp }) => {
  const { t } = useTranslation(namespace);
  const time_state = timestamp.state.replace(/_/g, ' ');

  const showInfo = () => {
    setPopupVisible(true);
  };

  const closeInfo = () => {
    setPopupVisible(false);
  };

  const popupRef = useRef();
  const [popupVisible, setPopupVisible] = useState(false);

  return (
    <View style={styles.eventContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconView, timestamp.isCurrent ? styles.currentIconView : null]} />
      </View>
      <View style={styles.event}>
        <Text
          style={[
            styles.timestamp,
            isPort ? styles.portEventTimestamp : null,
            timestamp.isCurrent ? styles.currentTimestamp : null,
          ]}>
          {t(`${timestamp.time_type} ${time_state}`)}
        </Text>
        {timestamp.time ? (
          <>
            <Text style={[styles.time, isPort ? styles.portEventTime : '']}>
              {moment(timestamp.time).format('YYYY-MM-DD HH:mm')}
            </Text>
          </>
        ) : null}
      </View>
      {timestamp.source ? (
        <>
          <TouchableOpacity ref={popupRef} style={styles.info} onPress={() => showInfo()}>
            <Info style={styles.infoIcon} />
          </TouchableOpacity>
          <Popover
            isVisible={popupVisible}
            popoverStyle={styles.infoPopover}
            from={popupRef}
            placement="left"
            onRequestClose={() => closeInfo()}>
            <Text style={styles.timestampSource}>
              {t('Timestamp received from {{source}}', {
                source: timestamp.source,
              })}
            </Text>
            <Text style={styles.timestampDescription}>
              {t('{{timetype}} {{timestate}} description.', {
                timetype: timestamp.time_type,
                timestate: time_state,
              })}
            </Text>
            {timestamp.created_at ? (
              <Text style={styles.timestampTime}>
                {t('Received at {{time}}', {
                  time: moment(timestamp.created_at).format('YYYY-MM-DD HH:mm'),
                })}
              </Text>
            ) : null}
          </Popover>
        </>
      ) : null}
    </View>
  );
});

PortcallTimestamp.propTypes = {
  isCurrent: PropTypes.bool,
  isPort: PropTypes.bool,
  namespace: PropTypes.string.isRequired,
  timestamp: PropTypes.object.isRequired,
};

export const PortcallHeader = memo(
  forwardRef((props, setButtonRef) => {
    const {
      headerStyle,
      isPinned,
      isPinning,
      onActionPress,
      onPinPress,
      section: { ship },
      setActiveHeader,
      namespace,
    } = props;

    const { t } = useTranslation(namespace);

    return (
      <View
        style={[
          styles.header,
          headerStyle,
          onActionPress || onPinPress || isPinned ? styles.headerWithActions : null,
          isPinned ? styles.pinnedHeader : null,
        ]}>
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => (setActiveHeader ? setActiveHeader(ship) : null)}
          activeOpacity={setActiveHeader ? 0.2 : 1}>
          <View style={styles.headerInfoContent}>
            <HeaderBadges badges={ship.badges} />
            <ShipInfo name={ship.vessel_name} nationality={ship.nationality} />
            <View style={styles.tripInfoContainer}>
              {ship.from_port && ship.to_port ? (
                <>
                  <Text style={styles.headerTripInfo}>{ship.from_port ? ship.from_port : t('Unknown port')}</Text>
                  <View style={styles.arrowContainer}>
                    <ArrowRight style={styles.arrowRight} />
                  </View>
                  <Text style={styles.headerTripInfo}>{ship.to_port ? ship.to_port : t('Unknown port')}</Text>
                  <View style={styles.arrowContainer}>
                    <ArrowRight style={styles.arrowRight} />
                  </View>
                  <Text style={styles.headerTripInfo}>{ship.next_port ? ship.next_port : t('Unknown port')}</Text>
                </>
              ) : (
                <Text style={styles.headerTripInfo}>{t('Trip details unknown')}</Text>
              )}
            </View>
            <Text style={styles.headerNextEvent}>
              {ship.next_event
                ? `${t(ship.next_event.title)} ${
                    // TODO Use proper regional time formatting.
                    moment(ship.next_event.ts).format('DD.MM.YYYY HH:mm')
                  }`
                : `${t('ETA/ETD unknown')}`}
            </Text>
          </View>
          {onPinPress || isPinned ? (
            <TouchableOpacity
              disabled={isPinning}
              onPress={() => (onPinPress ? onPinPress(ship) : null)}
              style={onActionPress ? styles.pinContainer : styles.headerActions}
              activeOpacity={onPinPress ? 0.2 : 1}>
              {isPinning ? (
                <ActivityIndicator color="#000000" />
              ) : isPinned ? (
                <Pin style={onActionPress ? styles.pin : styles.pinWithDots} />
              ) : (
                <Unpin style={onActionPress ? styles.pin : styles.pinWithDots} />
              )}
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
        {onActionPress ? (
          <TouchableOpacity
            onPress={() => {
              onActionPress(ship);
            }}
            ref={(ref) => setButtonRef(ref)}
            style={styles.headerActions}>
            <MaterialCommunityIcons name="dots-vertical" size={20} style={styles.headerDots} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  })
);

export const ShipInfo = memo(({ name, nationality }) => {
  return (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>{name}</Text>
      <Text style={styles.headerNationality}>{nationality}</Text>
    </View>
  );
});

export const HeaderBadges = memo(({ badges }) => {
  if (badges) {
    return (
      <View style={styles.headerBadges}>
        {badges.map((badge, index) => {
          switch (badge.type) {
            case 'success':
              switch (badge.value) {
                case 'arriving':
                  return <ArrivingBadge key={`badge-${index}`} text={badge.value} />;
                case 'at berth':
                  return <AtBerthBadge key={`badge-${index}`} text={badge.value} />;
                case 'departing':
                  return <DepartingBadge key={`badge-${index}`} text={badge.value} />;
              }
              break;
            case 'ok':
              return <OkBadge key={`badge-${index}`} text={badge.value} />;
            case 'warning':
              return <WarningBadge key={`badge-${index}`} text={badge.value} />;
            case 'medium_warning':
              return <MediumWarningBadge key={`badge-${index}`} text={badge.value} />;
            case 'info':
            default:
              return <InfoBadge key={`badge-${index}`} text={badge.value} />;
          }
        })}
      </View>
    );
  }
  return null;
});

// TOOO: Evaluate if memo is unnecessary
const InfoBadge = memo(({ text }) => {
  return (
    <View style={styles.infoBadge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
});

// TOOO: Evaluate if memo is unnecessary
const ArrivingBadge = memo(({ text }) => {
  return (
    <View style={[styles.infoBadge, styles.arrivingBadge]}>
      <Text style={[styles.badgeText, styles.arrivingBadgeText]}>{text}</Text>
    </View>
  );
});

// TOOO: Evaluate if memo is unnecessary
const AtBerthBadge = memo(({ text }) => {
  return (
    <View style={[styles.infoBadge, styles.atBerthBadge]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
});

// TOOO: Evaluate if memo is unnecessary
const DepartingBadge = memo(({ text }) => {
  return (
    <View style={[styles.infoBadge, styles.departingBadge]}>
      <Text style={[styles.badgeText, styles.departingBadgeText]}>{text}</Text>
    </View>
  );
});

// TOOO: Evaluate if memo is unnecessary
const WarningBadge = memo(({ text }) => {
  return (
    <View style={[styles.infoBadge, styles.warningBadge]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
});

// TOOO: Evaluate if memo is unnecessary
const MediumWarningBadge = memo(({ text }) => {
  return (
    <View style={[styles.infoBadge, styles.mediumwarningBadge]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
});

// TOOO: Evaluate if memo is unnecessary
const OkBadge = memo(({ text }) => {
  return (
    <View style={[styles.infoBadge, styles.okBadge]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
});

PortcallHeader.propTypes = {
  headerStyle: PropTypes.object,
  isPinned: PropTypes.bool,
  isPinning: PropTypes.bool,
  namespace: PropTypes.string.isRequired,
  onActionPress: PropTypes.func,
  onPinPress: PropTypes.func,
  section: PropTypes.object.isRequired,
  setActiveHeader: PropTypes.func,
  setButtonRef: PropTypes.func,
};

const styles = EStyleSheet.create({
  header: {
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
  },
  pinnedHeader: {
    backgroundColor: '$color_highlight',
  },
  headerWithActions: {
    paddingRight: 0,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  headerActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: '$gap',
  },
  headerInfoContent: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    flexGrow: 1,
    marginBottom: '$gap_tinier',
  },
  infoBadge: {
    borderRadius: '$border_radius',
    backgroundColor: '$color_tertiary',
    paddingHorizontal: '.375rem', //'$gap_tinier',
    paddingVertical: '$gap_tiny',
    marginRight: '$gap_tinier',
  },
  arrivingBadge: {
    backgroundColor: '$color_white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_dark',
  },
  arrivingBadgeText: {
    color: '$color_grey_dark',
  },
  atBerthBadge: {
    backgroundColor: '$color_success',
  },
  departingBadge: {
    color: '$color_grey_dark',
    backgroundColor: '$color_highlight',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_dark',
  },
  departingBadgeText: {
    color: '$color_grey_dark',
  },
  warningBadge: {
    backgroundColor: '$color_error',
  },
  mediumwarningBadge: {
    backgroundColor: '$color_medium_error',
  },
  okBadge: {
    backgroundColor: '$color_success',
  },
  badgeText: {
    color: '$color_white',
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_small',
    textTransform: 'uppercase',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_big',
    lineHeight: '$line_height',
    textTransform: 'uppercase',
    color: '$color_grey_dark',
    marginBottom: '$gap_tinier',
  },
  headerNationality: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_small',
    textTransform: 'uppercase',
    color: '$color_grey_dark',
    marginBottom: '$gap_tinier',
    marginLeft: '$gap_tiny',
    alignSelf: 'flex-start',
  },
  tripInfoContainer: {
    flexDirection: 'row',
    marginBottom: '$gap_tiny',
  },
  headerTripInfo: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '$gap_small',
  },
  arrowRight: {
    height: '$gap_small',
    width: '$gap_small',
  },
  headerNextEvent: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_small',
    color: '$color_grey_dark',
    marginBottom: '$gap_tiny',
  },
  pinContainer: {
    justifyContent: 'center',
    paddingLeft: '$gap_small',
  },
  pin: {
    alignSelf: 'flex-end',
    width: 24,
    height: 24,
  },
  pinWithDots: {
    width: 24,
    height: 24,
  },
  info: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '$gap_small',
  },
  infoIcon: {
    width: 32,
    height: 32,
  },
  infoPopover: {
    padding: '$gap',
    backgroundColor: '$color_white',
    width: '100%',
  },
  headerDots: {},
  content: {
    backgroundColor: '$color_primary',
    paddingTop: '$gap',
    paddingHorizontal: '$gap',
  },
  eventsContainer: {
    backgroundColor: '$color_tertiary',
    borderRadius: '$border_radius',
    paddingHorizontal: '$gap',
    marginBottom: '$gap',
  },
  events: {
    paddingTop: '$gap',
    paddingLeft: '$gap - 9',
    borderLeftColor: '$color_secondary',
    borderLeftWidth: 1,
  },
  portEvents: {
    backgroundColor: '$color_white',
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: '$gap',
  },
  event: {
    flexGrow: 1,
    alignSelf: 'center',
    flexShrink: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconView: {
    backgroundColor: '#11195B',
    borderRadius: '9 / 2',
    width: 9,
    height: 9,
    left: -12,
  },
  currentIconView: {
    borderRadius: '13 / 2',
    width: 13,
    height: 13,
    left: -14,
  },
  timestamp: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    color: '$color_white',
    marginBottom: '$gap_tiny',
  },
  timestampSource: {
    fontFamily: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '$font_size_normal',
    marginBottom: '$gap_small',
  },
  timestampDescription: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    marginBottom: '$gap_tinier',
  },
  timestampTime: {
    fontFamily: 'Open Sans Italic',
    fontStyle: 'italic',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
  },
  since: {
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
    color: '$color_white',
    marginBottom: '$gap_tiny',
  },
  time: {
    fontFamily: 'Open Sans Italic',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
    color: '$color_grey_lighter',
    marginBottom: '$gap_tiny',
  },
  portEventTimestamp: {
    color: '$color_near_black',
  },
  currentTimestamp: {
    fontFamily: 'Open Sans Bold',
    fontWeight: 'bold',
  },
  portEventSince: {
    color: '$color_grey_dark',
  },
  portEventTime: {
    color: '$color_grey',
  },
});
