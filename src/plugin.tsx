import { definePlugin, type SchemaType } from 'sanity'
import { GeopointInput, type GeopointInputProps } from './GeopointInput'
import type { GeopointSchemaType, MapboxInputConfig } from './types'

export const mapboxInput = definePlugin<MapboxInputConfig>((config) => {
  return {
    name: 'sanity-plugin-mapbox-input',
    form: {
      components: {
        input(props) {
          if (isGeopoint(props.schemaType)) {
            const castedProps = props as unknown as Omit<
              GeopointInputProps,
              'mapboxConfig'
            >

            return <GeopointInput {...castedProps} mapboxConfig={config} />
          }

          return props.renderDefault(props)
        },
      },
    },
  }
})

function isGeopoint(schemaType: SchemaType): schemaType is GeopointSchemaType {
  return isType('geopoint', schemaType)
}

function isType(name: string, schema?: SchemaType): boolean {
  if (schema?.name === name) {
    return true
  } else if (!schema?.name) {
    return false
  }

  return isType(name, schema?.type)
}
