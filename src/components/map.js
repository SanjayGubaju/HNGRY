/**
 * TODO: Change state when map is moved.
 * TODO: Implement Geolocation
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfoWindow from './infoWindow';

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = { zoom: 14 };
  }

  /**
   * Create the map, places, infoWindow and event listeners after the component is rendered
   * google.maps needs the DOM to exist before it can manipulate it
   */
  componentDidMount() {
    this.map = this.createMap();
    this.places = new google.maps.places.PlacesService(this.map);
    this.infoWindow = new google.maps.InfoWindow({
      content: document.getElementById('info-content'),
    });
    google.maps.event.addListener(this.map, 'zoom_changed', () => this.zoomChangeHandler());
  }
    // Fix geolocation later
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     const currLocation = {
    //       lng: position.coords.longitude,
    //       lat: position.coords.latitude,
    //     };
    //     // change to redux state later
    //     this.map.setCenter(currLocation);
    //   });
    // } else {
    //   console.log('This Browser doesn\'t support HTML5 geolocation');
    // }
  // }

  /**
   * If redux state is updated via search bar, pan the map to the new location
   * And start searching the new location for restaurants
   */
  componentDidUpdate() {
    const place = this.props.searchLocation;
    if (place.geometry) {
      this.map.panTo(place.geometry.location);
      this.search();
    } else {
      document.getElementById('autocomplete').placeholder = 'Enter a city';
    }
  }

  /**
   * Searches map for all restaurants, then drops markers on map where restaurants are
   */
  search() {
    let markers = [];
    const search = {
      bounds: this.map.getBounds(),
      types: ['restaurant'],
    };
    this.places.nearbySearch(search, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // clearResults();
        markers = this.clearMarkers(markers);
        // Create a marker for each hotel found, and
        // assign a letter of the alphabetic to each marker icon.
        for (let i = 0; i < results.length; i++) {
          // TODO: Change to numbers instead of letters
          const markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          const markerIcon = `https://developers.google.com/maps/documentation/javascript/images/marker_green${(markerLetter)}.png`;
          // Use marker animation to drop the icons incrementally on the map.
          markers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon,
          });
          // Show the details of that restaurant in an info window if marker is clicked.
          markers[i].placeResult = results[i];
          google.maps.event.addListener(markers[i], 'click', this.showInfoWindow.bind(this, markers[i]));
          setTimeout(this.dropMarker(i, markers), i * 100);
          // addResult(results[i], i);
        }
      }
    });
  }

  /**
   * Event listener function opens infoWindow of the marker that is clicked
   * @param  {object} marker [marker that was clicked]
   */
  showInfoWindow(marker) {
    this.places.getDetails({ placeId: marker.placeResult.place_id },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        this.infoWindow.open(this.map, marker);
        this.buildInfoWindow(place);
      });
  }

  /**
   * Constructs Info Window with data
   * @param  {Object} place object containing all info about restaurant
   */
  buildInfoWindow(place) {
    document.getElementById('info-window-name').textContent = place.name;
    document.getElementById('info-window-address').textContent = place.vicinity;
    document.getElementById('info-window-price').textContent = place.price_level;
  }

  /**
   * Drop markers on map
   * @param  {integer} i       [current count]
   * @param  {array} markers [array of markers]
   * @return {func}         [buildInfoWindow function to drop markers]
   */
  dropMarker(i, markers) {
    return () => {
      markers[i].setMap(this.map);
    };
  }

  /**
   * TODO:Need to fix, not clearing markers as of now
   */
  clearMarkers(markers) {
    for (let i = 0; i < markers.length; i++) {
      console.log(markers[i])
      if (markers[i]) {
        markers[i].setMap(null);
      }
    }
    return [];
  }

  /**
   * Creates the google map with no zoom, streetView and mapType control.
   * @return {Object} GoogleMap object is rendered at the #map dom element
   */
  createMap() {
    const mapOptions = {
      zoom: this.state.zoom,
      center: this.mapCenter(),
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
    };
    return new google.maps.Map(document.getElementById('map'), mapOptions);
  }

  /**
   * Center the google map at the intial lat and lng passed via this.props
   */
  mapCenter() {
    return new google.maps.LatLng(
      this.props.initialCenter.lat,
      this.props.initialCenter.lng,
    );
  }

  /**
   * When zoom event is triggered, update state.zoom
   */
  zoomChangeHandler() {
    this.setState({
      zoom: this.map.getZoom(),
    });
  }

  render() {
    return (
      <div className="map">
        <div className="map-canvas" id="map" />
        <InfoWindow />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { searchLocation: state.searchLocation };
}

export default connect(mapStateToProps)(Map);
