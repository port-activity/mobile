import { LogoInverted, LogoInvertedGavle, LogoInvertedRauma } from '@assets/images';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
//import { Image } from 'react-native';
//import Images from '@assets/images';

import { AuthContext } from '../context/Auth';

const NamespacedImage = ({ src, ...rest }) => {
  const { namespace } = useContext(AuthContext);
  //const img = src + (namespace !== 'common' ? capitalize(namespace) : '');
  try {
    switch (namespace) {
      case 'gavle':
        return <LogoInvertedGavle {...rest} />;
      case 'rauma':
        return <LogoInvertedRauma {...rest} />;
      default:
        return <LogoInverted {...rest} />;
    }
    /*
    if (Images[path]) {
      return <Image source={Images[path]} {...rest} />;
    } else {
      return <Image source={Images[src]} {...rest} />;
    }*/
  } catch (err) {
    return <LogoInverted {...rest} />;
    //return <Image source={Images[src]} {...rest} />;
  }
};

//const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join('').toLowerCase();

NamespacedImage.propTypes = {
  src: PropTypes.string.isRequired,
};

export default NamespacedImage;
