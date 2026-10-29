import type { ObjectSchemaType } from 'sanity'

export interface LatLng {
  lat: number
  lng: number
}

export interface Geopoint {
  _type: 'geopoint'
  _key?: string
  lat: number
  lng: number
  alt?: number
}

export interface GeopointSchemaType extends ObjectSchemaType {}

export interface MapboxInputConfig {
  apiKey: string
  defaultZoom?: number
  defaultLocation?: LatLng
  mapStyle?: string
}
