import {useCallback, useEffect, useId, useRef, useState} from 'react'
import {Box, Button, Dialog, Grid, Stack, Text} from '@sanity/ui'
import {EditIcon} from '@sanity/icons/Edit'
import {TrashIcon} from '@sanity/icons/Trash'
import {
  ChangeIndicator,
  ObjectInputProps,
  set,
  setIfMissing,
  unset,
  type Path,
} from 'sanity'
import type {Geopoint, GeopointSchemaType, LatLng, MapboxInputConfig} from '../types'
import {GeopointSelect} from './GeopointSelect'
import './GeopointInput.css'

const EMPTY_PATH: Path = []

const getStaticImageUrl = (value: LatLng, apiKey: string) => {
  const {lat, lng} = value
  const overlay = `pin-s+d00(${lng},${lat})`

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlay}/${lng},${lat},13,0/640x300@2x?access_token=${apiKey}`
}

export type GeopointInputProps = ObjectInputProps<Geopoint, GeopointSchemaType> & {
  mapboxConfig: MapboxInputConfig
}

export function GeopointInput(props: GeopointInputProps) {
  const {
    changed,
    elementProps,
    focused,
    mapboxConfig: config,
    onChange,
    onPathFocus,
    path,
    readOnly,
    schemaType,
    value,
  } = props

  const {
    id,
    ref: inputRef,
    onBlur: handleBlur,
    onFocus: handleFocus,
    'aria-describedby': ariaDescribedBy,
  } = elementProps

  const schemaTypeName = schemaType.name
  const dialogId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const handleFocusButton = useCallback(() => inputRef?.current?.focus(), [inputRef])
  const [modalOpen, setModalOpen] = useState(false)

  const handleCloseModal = useCallback(() => {
    if (dialogRef.current) dialogRef.current.blur()
    setModalOpen(false)
    handleFocusButton()
  }, [handleFocusButton])

  const handleToggleModal = useCallback(() => {
    setModalOpen((currentState) => !currentState)
  }, [])

  const handleChange = useCallback(
    (latLng: LatLng) => {
      onChange([
        setIfMissing({_type: schemaTypeName}),
        set(latLng.lat, ['lat']),
        set(latLng.lng, ['lng']),
      ])
    },
    [schemaTypeName, onChange],
  )

  const handleClear = useCallback(() => {
    onChange(unset())
  }, [onChange])

  useEffect(() => {
    if (modalOpen) {
      onPathFocus(EMPTY_PATH)
    }
  }, [modalOpen, onPathFocus])

  if (!config?.apiKey) {
    return (
      <Stack gap={3}>
        <Text size={1}>
          The{' '}
          <a href="https://www.sanity.io/docs/schema-types/geopoint-type">Geopoint type</a> needs a
          Mapbox access token.
        </Text>
        <Text size={1}>
          Pass a valid token as <code>apiKey</code> in your <code>mapboxInput</code> plugin config.
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap={3}>
      {value && (
        <ChangeIndicator path={path} isChanged={changed} hasFocus={!!focused}>
          <img
            className="sanity-plugin-mapbox-input__previewImage"
            src={getStaticImageUrl(value, config.apiKey)}
            alt="Map location"
            onClick={handleFocusButton}
            onDoubleClick={handleToggleModal}
          />
        </ChangeIndicator>
      )}

      <Box>
        <Grid gridTemplateColumns={value ? 2 : 1} gap={3}>
          <Button
            aria-describedby={ariaDescribedBy}
            disabled={readOnly}
            icon={value ? EditIcon : undefined}
            id={id}
            mode="ghost"
            onClick={handleToggleModal}
            onFocus={handleFocus}
            padding={3}
            ref={inputRef}
            text={value ? 'Edit' : 'Set location'}
          />

          {value && (
            <Button
              disabled={readOnly}
              icon={TrashIcon}
              mode="ghost"
              onClick={handleClear}
              padding={3}
              text="Remove"
              tone="critical"
            />
          )}
        </Grid>
      </Box>

      {modalOpen && (
        <Dialog
          header="Place the marker on the map"
          id={`${dialogId}_dialog`}
          onBlur={handleBlur}
          onClose={handleCloseModal}
          ref={dialogRef}
          width={1}
        >
          <div className="sanity-plugin-mapbox-input__dialogInner">
            <GeopointSelect
              apiKey={config.apiKey}
              value={value || undefined}
              onChange={readOnly ? undefined : handleChange}
              defaultLocation={config.defaultLocation}
              defaultZoom={config.defaultZoom}
              mapStyle={config.mapStyle}
            />
          </div>
        </Dialog>
      )}
    </Stack>
  )
}
