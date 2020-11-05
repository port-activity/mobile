import moment from 'moment';
import React, { forwardRef, memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { HeaderBadges, ShipInfo } from './PortcallTimeline';

export const SlotItem = memo(
  forwardRef((props) => {
    const { headerStyle, item, index, setActiveHeader, t } = props;

    const formatTs = (ts) => (ts ? moment(ts).format('DD.MM.YYYY HH:mm') : 'n/a');

    const Timerow = ({ text, ts, badges }) => (
      <View style={styles.timeRow}>
        <View style={styles.timeRowName}>
          <Text>{t(text)}</Text>
        </View>
        <View style={styles.timeRowTimeBadges}>{badges ? <HeaderBadges badges={badges} /> : null}</View>
        <Text style={styles.timeRowTime}>{formatTs(ts)} </Text>
      </View>
    );

    const statusMap = {
      offered: 'medium_warning',
      accepted: 'ok',
      updated: 'ok',
    };

    const alertStateMap = {
      green: 'ok',
      yellow: 'medium_warning',
      red: 'warning',
    };

    const alertStateTextMap = {
      green: 'ok',
      yellow: 'warn',
      red: 'late',
    };

    const statusBadgeType = statusMap[item.slot_reservation_status]
      ? statusMap[item.slot_reservation_status]
      : 'medium_warning';

    return (
      <View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => (setActiveHeader ? setActiveHeader(ship) : null)}
          activeOpacity={setActiveHeader ? 0.2 : 1}>
          <View style={styles.headerInfoContent}>
            <Text style={styles.counter}>{index + 1}.</Text>
            <View style={styles.dataArea}>
              <HeaderBadges
                badges={[
                  { type: statusBadgeType, value: item.readable_slot_reservation_status },
                  { type: 'info', value: item.berth_name },
                ]}
              />
              <ShipInfo name={item.vessel_name} nationality={item.vessel_nationality} />
              <Timerow text="RTA" ts={item.rta_window_start} />
              <Timerow text="JIT ETA" ts={item.jit_eta} />
              <Timerow
                text="Live ETA"
                ts={item.live_eta}
                badges={[
                  {
                    type: alertStateMap[item.jit_eta_alert_state],
                    value: alertStateTextMap[item.jit_eta_alert_state],
                  },
                ]}
              />
              <Timerow text="PTD" ts={item.ptd} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  })
);

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
  },
  headerInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  counter: {
    fontSize: '$font_size_big',
    flexGrow: 1,
    width: 55,
    maxWidth: 55,
  },
  dataArea: {
    flexDirection: 'column',
    flexGrow: 5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  timeRowName: {
    flex: 1,
  },
  timeRowTime: {
    flex: 2,
  },
  timeRowTimeBadges: {
    flex: 1,
  },
});
