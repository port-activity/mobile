import { Clear, Search } from '@assets/images';
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { Platform, TextInput, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const StyledSearch = ({ onSearch, t }) => {
  const [showClearButton, setShowClearButton] = useState(false);
  const inputRef = useRef();

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <View style={styles.imageContainer}>
          <Search style={styles.searchIcon} />
        </View>
        <TextInput
          style={styles.input}
          keyboardType="default"
          clearButtonMode="while-editing"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          ref={(ref) => (inputRef.current = ref)}
          onEndEditing={() => setShowClearButton(false)}
          onFocus={() => setShowClearButton(true)}
          placeholder={t('Search for vessels')}
          placeholderTextColor="#747D7D"
          onChangeText={(text) => {
            onSearch(text);
          }}
        />
        {showClearButton && Platform.OS === 'android' ? (
          <View style={styles.clearImageContainer}>
            <TouchableOpacity
              onPress={(e) => {
                e.preventDefault();
                inputRef.current.clear();
                onSearch('');
              }}>
              <Clear style={styles.clearIcon} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    padding: '$gap',
    backgroundColor: '$color_grey_lighter',
    borderBottomColor: '$color_grey_light',
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '$color_white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '$color_grey_light',
    borderRadius: '$gap_big',
  },
  imageContainer: {
    justifyContent: 'center',
    paddingLeft: '$gap_small',
    borderRadius: '$border_radius',
  },
  searchIcon: {
    height: '1.125rem',
    width: '1.125rem',
  },
  input: {
    flexGrow: 1,
    '@media ios': {
      padding: '$gap_small',
    },
    '@media android': {
      paddingVertical: '$gap_tiny',
      paddingHorizontal: '$gap_small',
    },
    color: '$color_near_black',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
  },
  clearImageContainer: {
    justifyContent: 'center',
    paddingHorizontal: '$gap_small',
    borderRadius: '$border_radius',
  },
  clearIcon: {
    height: '1.125rem',
    width: '1.125rem',
  },
});

StyledSearch.propTypes = {
  onSearch: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default StyledSearch;
