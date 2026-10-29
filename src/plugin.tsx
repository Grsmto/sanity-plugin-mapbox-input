import {
  definePlugin,
  type ArraySchemaType,
  type SchemaType,
} from 'sanity'
import { GeopointInput, type GeopointInputProps } from './GeopointInput'
import {
  MultiGeopointInput,
  type MultiGeopointInputProps,
} from './MultiGeopointInput'
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

          if (isArrayOfGeopoint(props.schemaType)) {
            const castedProps = props as unknown as Omit<
              MultiGeopointInputProps,
              'mapboxConfig'
            >

            return <MultiGeopointInput {...castedProps} mapboxConfig={config} />
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

function isArrayOfGeopoint(
  schemaType: SchemaType
): schemaType is ArraySchemaType {
  if (schemaType.jsonType !== 'array') {
    return false
  }

  const ofTypes = (schemaType as ArraySchemaType).of

  return ofTypes?.length === 1 && isType('geopoint', ofTypes[0])
}

function isType(name: string, schema?: SchemaType): boolean {
  if (schema?.name === name) {
    return true
  } else if (!schema?.name) {
    return false
  }

  return isType(name, schema?.type)
}
