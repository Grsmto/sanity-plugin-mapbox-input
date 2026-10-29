import { useEffect, useRef } from 'react'
import {
  useControl,
  type ControlPosition,
  type IControl,
} from 'react-map-gl/mapbox'
import MapboxGeocoder, {
  type GeocoderOptions,
  type Result,
} from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import type { LatLng } from './types'

type GeocoderControlProps = Omit<
  GeocoderOptions,
  'accessToken' | 'mapboxgl' | 'marker'
> & {
  mapboxAccessToken: string
  position?: ControlPosition
  onResult?: (lngLat: LatLng) => void
}

export function GeocoderControl(props: GeocoderControlProps) {
  const { mapboxAccessToken, position = 'top-left', onResult, language } = props
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useControl(
    () => {
      const ctrl = new MapboxGeocoder({
        marker: false,
        accessToken: mapboxAccessToken,
        language,
      })

      ctrl.on('result', (event: { result: Result }) => {
        const { result } = event
        const location =
          result?.center ||
          (result?.geometry?.type === 'Point'
            ? result.geometry.coordinates
            : undefined)

        if (location && onResultRef.current) {
          onResultRef.current({ lng: location[0], lat: location[1] })
        }
      })

      return ctrl as unknown as IControl
    },
    { position }
  )

  return null
}
