import 'mapbox-gl/dist/mapbox-gl.css?raw'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css?raw'
import PropTypes from 'prop-types'
import React from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import Geocoder from 'react-map-gl-geocoder'
import styles from '../styles/GeopointSelect.css'
import Pin from './Pin'

class GeopointSelect extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    defaultLocation: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    defaultZoom: PropTypes.number,
    locale: PropTypes.string,
  }

  static defaultProps = {
    defaultZoom: 8,
    defaultLocation: { lng: 10.74609, lat: 59.91273 },
  }

  state = {
    viewport: {
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8,
    },
  }

  mapRef = React.createRef()

  constructor(props) {
    super(props)

    this.state = {
      viewport: {
        latitude: this.getValueLatLng().lat,
        longitude: this.getValueLatLng().lng,
        zoom: props.defaultZoom,
      },
    }
  }

  handleViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport },
    })
  }

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 }

    return this.handleViewportChange({
      ...viewport,
      ...geocoderDefaultOverrides,
    })
  }

  getValueLatLng() {
    const { value, defaultLocation } = this.props

    return {
      lat: value ? value.lat : defaultLocation.lat,
      lng: value ? value.lng : defaultLocation.lng,
    }
  }

  handleOnResult = event => {
    this.setValue(event.result.geometry.coordinates)
  }

  handleMarkerDragEnd = event => {
    this.setValue(event.lngLat)
  }

  handleMapClick = pointerEvent => {
    if (pointerEvent.target.classList.contains('overlays')) {
      this.setValue(pointerEvent.lngLat)
    }
  }

  setValue(geoPoint) {
    this.props.onChange(geoPoint)
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <ReactMapGL
          width="100%"
          height="100%"
          ref={this.mapRef}
          {...this.state.viewport}
          onViewportChange={viewport => this.setState({ viewport })}
          mapboxApiAccessToken={this.props.apiKey}
          onClick={this.handleMapClick}
        >
          <Geocoder
            mapRef={this.mapRef}
            onResult={this.handleOnResult}
            onViewportChange={this.handleGeocoderViewportChange}
            mapboxApiAccessToken={this.props.apiKey}
            position="top-left"
            language={this.props.locale}
          />
          <Marker
            latitude={this.getValueLatLng().lat}
            longitude={this.getValueLatLng().lng}
            draggable
            onDragEnd={this.handleMarkerDragEnd}
          >
            <Pin />
          </Marker>
        </ReactMapGL>
      </div>
    )
  }
}

export default GeopointSelect
