import React from 'react';
import { Alert } from 'react-native';
import { Permissions } from 'expo';

const requestLocationPermission = async () => {
  const { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    Alert.alert(
      'Alert',
      'Permission to access location was denied',
      [{ text: 'OK', onPress: () => false }],
      { cancelable: false },
    );
  } else {
    return true;
  }
};

class CheckLocation extends React.Component {
  static async hasLocationPermission() {
    const gotPermission = await requestLocationPermission();
    if (gotPermission) {
      return true;
    }
    return false;
  }
}

export default CheckLocation;
