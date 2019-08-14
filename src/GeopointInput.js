import PropTypes from 'prop-types'
import React from 'react'
import { StaticMap, Marker } from 'react-map-gl'
import config from 'config:mapbox-input'
import Button from 'part:@sanity/components/buttons/default'
import Dialog from 'part:@sanity/components/dialogs/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import {
  PatchEvent,
  set,
  setIfMissing,
  unset,
} from 'part:@sanity/form-builder/patch-event'
import styles from '../styles/GeopointInput.css'
import GeopointSelect from './GeopointSelect'
import Pin from './Pin'

const getLocale = context => {
  const intl = context.intl || {}
  return (
    intl.locale ||
    (typeof window !== 'undefined' && window.navigator.language) ||
    'en'
  )
}

class GeopointInput extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    markers: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
      })
    ),
    value: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    type: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
  }

  static defaultProps = {
    markers: [],
  }

  static contextTypes = {
    intl: PropTypes.shape({
      locale: PropTypes.string,
    }),
  }

  constructor() {
    super()

    this.handleToggleModal = this.handleToggleModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)

    this.state = {
      modalOpen: false,
    }
  }

  handleToggleModal() {
    this.setState(prevState => ({ modalOpen: !prevState.modalOpen }))
  }

  handleChange = lngLat => {
    const { type, onChange } = this.props
    onChange(
      PatchEvent.from([
        setIfMissing({
          _type: type.name,
        }),
        set(lngLat[1], ['lat']),
        set(lngLat[0], ['lng']),
      ])
    )
  }

  handleClear = () => {
    const { onChange } = this.props
    onChange(PatchEvent.from(unset()))
  }

  handleCloseModal() {
    this.setState({ modalOpen: false })
  }

  render() {
    const { value, type, markers } = this.props

    if (!config || !config.apiKey) {
      return (
        <div>
          <p>
            The{' '}
            <a href="https://sanity.io/docs/schema-types/geopoint-type">
              Geopoint type
            </a>{' '}
            needs a Mapbox API token.
          </p>
          <p>
            Please enter the API token with access to these services in
            <code style={{ whitespace: 'nowrap' }}>
              `&lt;project-root&gt;/config/mapbox-input.json`
            </code>
          </p>
        </div>
      )
    }

    return (
      <Fieldset
        legend={type.title}
        description={type.description}
        className={styles.root}
        markers={markers}
      >
        {value && (
          <div>
            <StaticMap
              width="100%"
              height={300}
              latitude={value.lat}
              longitude={value.lng}
              zoom={13}
              mapboxApiAccessToken={config.apiKey}
            >
              <Marker latitude={value.lat} longitude={value.lng}>
                <Pin />
              </Marker>
            </StaticMap>
          </div>
        )}

        <div className={styles.functions}>
          <Button onClick={this.handleToggleModal}>
            {value ? 'Edit' : 'Set location'}
          </Button>

          {value && (
            <Button type="button" onClick={this.handleClear}>
              Remove
            </Button>
          )}
        </div>

        {this.state.modalOpen && (
          <Dialog
            title="Place on map"
            onClose={this.handleCloseModal}
            onCloseClick={this.handleCloseModal}
            onOpen={this.handleOpenModal}
            message="Select location by dragging the marker or search for a place"
            isOpen={this.state.modalOpen}
          >
            <div className={styles.dialogInner}>
              <GeopointSelect
                value={value}
                apiKey={config.apiKey}
                onChange={this.handleChange}
                defaultLocation={config.defaultLocation}
                defaultZoom={config.defaultZoom}
                locale={getLocale(this.context)}
              />
            </div>
          </Dialog>
        )}
      </Fieldset>
    )
  }
}

export default GeopointInput
