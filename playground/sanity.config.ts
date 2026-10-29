import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {mapboxInput} from 'sanity-plugin-mapbox-input'
import {schemaTypes} from './schemaTypes'

const mapboxToken = process.env.SANITY_STUDIO_MAPBOX_TOKEN || ''

export default defineConfig({
  name: 'mapbox-input-playground',
  title: 'Mapbox Input Playground',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'playground',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool(),
    mapboxInput({
      apiKey: mapboxToken,
      defaultZoom: 11,
      defaultLocation: {lat: 40.7058254, lng: -74.1180863},
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
