import { CalendarClock } from '@assets/images';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import 'moment/min/locales';
import EStyleSheet from 'react-native-extended-stylesheet';
import DateTimePicker from 'react-native-modal-datetime-picker';

import { StyledInput } from '../components/Input';

const StyledDateTimePicker = ({
  dateTimeContainerStyle,
  inputGroupStyle,
  inputLabelStyle,
  inputStyle,
  label,
  onValueSelect,
  t,
  textInputStyle,
  value,
}) => {
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(value ? value : moment());

  const showDateTimePicker = () => {
    setIsDateTimePickerVisible(true);
  };

  const hideDateTimePicker = () => {
    setIsDateTimePickerVisible(false);
  };

  const handleDatePicked = (dateTime) => {
    hideDateTimePicker();
    setSelectedDateTime(moment(dateTime));
    if (onValueSelect) {
      onValueSelect(moment(dateTime));
    }
  };

  const labelText = label ? label : t('Time and date');
  return (
    <View style={[styles.container, dateTimeContainerStyle]}>
      <TouchableOpacity onPress={showDateTimePicker}>
        <StyledInput
          editable={false}
          Icon={CalendarClock}
          iconStyle={styles.icon}
          inputGroupStyle={{ ...styles.inputGroup, ...inputGroupStyle }}
          inputLabelStyle={{ ...styles.inputLabel, ...inputLabelStyle }}
          inputStyle={{ ...styles.input, ...inputStyle }}
          label={labelText}
          onTouchStart={showDateTimePicker}
          textInputStyle={{ ...styles.textInput, ...textInputStyle }}
          value={selectedDateTime.format('DD.MM.YYYY HH:mm')} // TODO Use proper regional time formatting.
        />
      </TouchableOpacity>
      <DateTimePicker
        isDarkModeEnabled={false}
        isVisible={isDateTimePickerVisible}
        date={selectedDateTime.toDate()}
        mode="datetime"
        onCancel={hideDateTimePicker}
        onConfirm={handleDatePicked}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    marginBottom: '$gap',
  },
  input: {
    marginBottom: 0,
  },
  icon: {
    height: '$gap',
    width: '$gap',
  },
  inputGroup: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_lighter',
  },
});

StyledDateTimePicker.propTypes = {
  dateTimeContainerStyle: PropTypes.object,
  inputGroupStyle: PropTypes.object,
  inputLabelStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  label: PropTypes.string,
  onValueSelect: PropTypes.func,
  t: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
  value: PropTypes.object,
};

export default StyledDateTimePicker;
