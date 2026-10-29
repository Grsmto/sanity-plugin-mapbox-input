import { type FC, useCallback, useMemo, useState } from 'react'
import Map, {
  Marker,
  type MapMouseEvent,
  type MarkerDragEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Geopoint, LatLng } from './types'
import { GeocoderControl } from './GeocoderControl'
import { Pin } from './Pin'

const FALLBACK_LOCATION: LatLng = { lat: 40.7058254, lng: -74.1180863 }

export interface GeopointSelectProps {
  apiKey: string
  value?: Geopoint
  onChange?: (latLng: LatLng) => void
  defaultLocation?: LatLng
  defaultZoom?: number
  mapStyle?: string
  locale?: string
}

export const GeopointSelect: FC<GeopointSelectProps> = ({
  apiKey,
  value,
  onChange,
  defaultLocation = FALLBACK_LOCATION,
  defaultZoom = 8,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  locale,
}) => {
  const center = useMemo((): LatLng => {
    return {
      lat: value?.lat ?? defaultLocation.lat,
      lng: value?.lng ?? defaultLocation.lng,
    }
  }, [value, defaultLocation])

  const [viewState, setViewState] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: defaultZoom,
  })

  const setValue = useCallback(
    (latLng: LatLng) => {
      onChange?.(latLng)
    },
    [onChange]
  )

  const handleMarkerDragEnd = useCallback(
    (event: MarkerDragEvent) => {
      setValue({ lat: event.lngLat.lat, lng: event.lngLat.lng })
    },
    [setValue]
  )

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      setValue({ lat: event.lngLat.lat, lng: event.lngLat.lng })
    },
    [setValue]
  )

  const handleMove = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState)
  }, [])

  const handleGeocoderResult = useCallback(
    (latLng: LatLng) => {
      setValue(latLng)
      setViewState((current) => ({
        ...current,
        latitude: latLng.lat,
        longitude: latLng.lng,
      }))
    },
    [setValue]
  )

  const language =
    locale ||
    (typeof navigator !== 'undefined' ? navigator.language : undefined)

  return (
    <Map
      {...viewState}
      onMove={handleMove}
      mapboxAccessToken={apiKey}
      mapStyle={mapStyle}
      style={{ width: '100%', height: '100%' }}
      onClick={handleMapClick}
    >
      <GeocoderControl
        mapboxAccessToken={apiKey}
        position="top-left"
        language={language}
        onResult={handleGeocoderResult}
      />
      <Marker
        latitude={center.lat}
        longitude={center.lng}
        draggable={Boolean(onChange)}
        onDragEnd={handleMarkerDragEnd}
      >
        <Pin />
      </Marker>
    </Map>
  )
}
