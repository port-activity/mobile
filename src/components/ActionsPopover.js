import PropTypes from 'prop-types';
import React, { forwardRef, useState, useEffect } from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Popover from 'react-native-popover-view';

export const ActionsPopOver = forwardRef((props, ref) => {
  const { actions, componentStyles, onAction, onclose, placement, show, showArrow, title } = props;
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const renderContent = () => {
    return (
      <View style={[styles.content, componentStyles ? componentStyles.content : null]}>
        {title ? (
          <View style={[styles.titleContainer, componentStyles ? componentStyles.titleContainer : null]}>
            <Text style={[styles.title, componentStyles ? componentStyles.title : null]}>{title}</Text>
          </View>
        ) : null}
        {actions.map((action, index) => renderAction(action, index))}
      </View>
    );
  };

  const renderAction = (action, index) => {
    return (
      <TouchableOpacity
        style={[styles.action, componentStyles ? componentStyles.action : null]}
        onPress={() => {
          onAction(index, action.contextData);
          closePopover();
        }}
        key={action.title}>
        <Text style={[styles.actionTitle, componentStyles ? componentStyles.actionTitle : null]}>{action.title}</Text>
      </TouchableOpacity>
    );
  };

  const closePopover = () => {
    setIsVisible(false);
    onclose();
  };

  return (
    <View style={[styles.container, componentStyles ? componentStyles.container : null]}>
      <Popover
        animationConfig={{
          duration: 400,
        }}
        arrowStyle={showArrow ? styles.arrowStyle : styles.hiddenArrow}
        isVisible={isVisible}
        from={ref}
        onRequestClose={closePopover}
        placement={placement ? placement : 'auto'}
        verticalOffset={Platform.OS === 'ios' ? 0 : -StatusBar.currentHeight}>
        {renderContent()}
      </Popover>
    </View>
  );
});

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$color_primary',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: '$gap',
    borderBottomColor: '$color_grey',
    borderBottomWidth: 1,
  },
  title: {
    alignSelf: 'center',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_normal',
    color: '$color_grey',
  },
  content: {
    backgroundColor: '$color_grey_lighter',
  },
  action: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: '$gap',
    borderBottomColor: '$color_grey_light',
    borderBottomWidth: 1,
  },
  actionTitle: {
    alignSelf: 'center',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '$font_size_smaller',
    color: '$color_near_black',
    paddingHorizontal: '$gap_big',
  },
  arrowStyle: {
    width: '$gap',
    height: '$gap',
    backgroundColor: '$color_white',
  },
  hiddenArrow: {
    backgroundColor: 'transparent',
  },
});

ActionsPopOver.propTypes = {
  actions: PropTypes.array.isRequired,
  containerStyle: PropTypes.object,
  onAction: PropTypes.func.isRequired,
  onclose: PropTypes.func.isRequired,
  placement: PropTypes.string,
  show: PropTypes.bool,
  showArrow: PropTypes.bool,
  title: PropTypes.string,
};
