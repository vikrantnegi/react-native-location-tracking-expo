import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { MapView, Constants, Location } from 'expo';
import CheckLocation from '../components/Permission';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../components/Loader';
const { Marker, AnimatedRegion, Polyline } = MapView;

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 29.95539;
const LONGITUDE = 78.07513;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Map extends React.Component {
  static navigationOptions = {
    title: 'Map',
    headerStyle: {
      backgroundColor: '#f4511e',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      routeCoordinates: [],
      coordinate: new AnimatedRegion({
        latitude: null,
        longitude: null,
      }),
    };
  }

  componentDidMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      Alert.alert(
        'Alert',
        'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        [{ text: 'OK', onPress: () => false }],
        { cancelable: false },
      );
    } else {
      this.getLocationPermission();
    }
  }

  getLocationPermission = async () => {
    const hasPermission = await CheckLocation.hasLocationPermission();
    if (hasPermission) {
      this.watchLocation();
      this.getCurrentLocation();
      this.setDestination();
    }
  };

  watchLocation = () => {
    const { coordinate } = this.state;
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        distanceInterval: 5,
      },
      position => {
        const { routeCoordinates } = this.state;
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
          latitude,
          longitude,
        };

        coordinate.timing(newCoordinate).start();

        // below code not working in expo app - react native issue with expo: https://github.com/react-community/react-native-maps/issues/2251
        // if (Platform.OS === 'android') {
        //   if (this.marker) {
        //     this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
        //   }
        // } else {
        //   coordinate.timing(newCoordinate).start();
        // }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
        });
      },
    );
  };

  getCurrentLocation = () => {
    Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    }).then(position => {
      const { latitude, longitude } = position.coords;
      this.setState({
        origin: {
          latitude,
          longitude,
        },
        latitude,
        longitude,
      });
    });
  };

  setDestination = () => {
    const { navigation } = this.props;
    const data = navigation.getParam('data', 'no data');
    const details = navigation.getParam('details', 'no details');

    const address = data.description;
    const latitude = details.geometry.location.lat;
    const longitude = details.geometry.location.lng;

    this.setState({
      destination: {
        latitude,
        longitude,
      },
    });
  };

  getMapRegion = () => ({
    latitude: this.state.latitude || LATITUDE,
    longitude: this.state.longitude || LONGITUDE,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  render() {
    if (this.state.latitude === null && this.state.longitude === null) {
      return <Loader loading text="Loading Map..." />;
    }

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showUserLocation
          followUserLocation
          loadingEnabled
          provider="google"
          ref={c => (this.mapView = c)}
          region={this.state.latitude ? this.getMapRegion() : null}
        >
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
          />
          <MapViewDirections
            origin={this.state.origin}
            destination={this.state.destination}
            apikey="AIzaSyAET33fvxXeERXcELnhI4AwemdvQGKPsXk"
            strokeWidth={3}
            strokeColor="hotpink"
            onReady={result => {
              this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: width / 20,
                  bottom: height / 20,
                  left: width / 20,
                  top: height / 20,
                },
              });
            }}
          />
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
});
