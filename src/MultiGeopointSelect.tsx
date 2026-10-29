import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, {
  Marker,
  type MapMouseEvent,
  type MapRef,
  type MarkerDragEvent,
  type MarkerEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl/mapbox'
import { LngLatBounds } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { GeopointItem, LatLng } from './types'
import { GeocoderControl } from './GeocoderControl'
import { Pin } from './Pin'

const FALLBACK_LOCATION: LatLng = { lat: 40.7058254, lng: -74.1180863 }

export interface MultiGeopointSelectProps {
  apiKey: string
  value?: GeopointItem[]
  activeKey?: string
  onSelect?: (key: string) => void
  onAdd?: (latLng: LatLng) => void
  onMove?: (key: string, latLng: LatLng) => void
  defaultLocation?: LatLng
  defaultZoom?: number
  mapStyle?: string
  locale?: string
}

export const MultiGeopointSelect: FC<MultiGeopointSelectProps> = ({
  apiKey,
  value = [],
  activeKey,
  onSelect,
  onAdd,
  onMove,
  defaultLocation = FALLBACK_LOCATION,
  defaultZoom = 8,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  locale,
}) => {
  const mapRef = useRef<MapRef | null>(null)
  const fittedCountRef = useRef(-1)

  const initialCenter = useMemo((): LatLng => {
    const first = value[0]

    return {
      lat: first?.lat ?? defaultLocation.lat,
      lng: first?.lng ?? defaultLocation.lng,
    }
  }, [value, defaultLocation])

  const [viewState, setViewState] = useState({
    latitude: initialCenter.lat,
    longitude: initialCenter.lng,
    zoom: defaultZoom,
  })

  const fitToPoints = useCallback(
    (points: GeopointItem[]) => {
      const map = mapRef.current

      if (!map || points.length === 0) {
        return
      }

      if (points.length === 1) {
        map.flyTo({
          center: [points[0].lng, points[0].lat],
          zoom: Math.max(map.getZoom(), defaultZoom),
        })
        return
      }

      const bounds = points.reduce(
        (acc, point) => acc.extend([point.lng, point.lat]),
        new LngLatBounds(
          [points[0].lng, points[0].lat],
          [points[0].lng, points[0].lat]
        )
      )

      map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 500 })
    },
    [defaultZoom]
  )

  useEffect(() => {
    if (value.length === fittedCountRef.current) {
      return
    }

    fittedCountRef.current = value.length
    fitToPoints(value)
  }, [value, fitToPoints])

  const handleMarkerDragEnd = useCallback(
    (key: string, event: MarkerDragEvent) => {
      onMove?.(key, { lat: event.lngLat.lat, lng: event.lngLat.lng })
    },
    [onMove]
  )

  const handleMarkerClick = useCallback(
    (key: string, event: MarkerEvent<MouseEvent>) => {
      event.originalEvent.stopPropagation()
      onSelect?.(key)
    },
    [onSelect]
  )

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      onAdd?.({ lat: event.lngLat.lat, lng: event.lngLat.lng })
    },
    [onAdd]
  )

  const handleMove = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState)
  }, [])

  const handleGeocoderResult = useCallback(
    (latLng: LatLng) => {
      onAdd?.(latLng)
      setViewState((current) => ({
        ...current,
        latitude: latLng.lat,
        longitude: latLng.lng,
      }))
    },
    [onAdd]
  )

  const language =
    locale ||
    (typeof navigator !== 'undefined' ? navigator.language : undefined)

  const canEdit = Boolean(onAdd || onMove)

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={handleMove}
      mapboxAccessToken={apiKey}
      mapStyle={mapStyle}
      style={{ width: '100%', height: '100%' }}
      onClick={canEdit ? handleMapClick : undefined}
    >
      <GeocoderControl
        mapboxAccessToken={apiKey}
        position="top-left"
        language={language}
        onResult={handleGeocoderResult}
      />
      {value.map((point) => {
        const isActive = point._key === activeKey

        return (
          <Marker
            key={point._key}
            latitude={point.lat}
            longitude={point.lng}
            anchor="bottom"
            draggable={Boolean(onMove) && isActive}
            onClick={(event) => handleMarkerClick(point._key, event)}
            onDragEnd={(event) => handleMarkerDragEnd(point._key, event)}
          >
            <Pin active={isActive} />
          </Marker>
        )
      })}
    </Map>
  )
}
