import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Box, Button, Dialog, Flex, Grid, Stack, Text } from '@sanity/ui'
import { EditIcon } from '@sanity/icons/Edit'
import { TrashIcon } from '@sanity/icons/Trash'
import {
  ChangeIndicator,
  set,
  unset,
  type ArrayOfObjectsInputProps,
  type Path,
} from 'sanity'
import type { GeopointItem, LatLng, MapboxInputConfig } from './types'
import { MultiGeopointSelect } from './MultiGeopointSelect'
import '../styles/GeopointInput.css'

const EMPTY_PATH: Path = []

function createKey(): string {
  return Math.random().toString(36).slice(2, 14)
}

const getStaticImageUrl = (points: LatLng[], apiKey: string) => {
  const overlay = points
    .map((point) => `pin-s+d00(${point.lng},${point.lat})`)
    .join(',')

  if (points.length === 1) {
    const { lat, lng } = points[0]

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlay}/${lng},${lat},13,0/640x300@2x?access_token=${apiKey}`
  }

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlay}/auto/640x300@2x?access_token=${apiKey}`
}

export type MultiGeopointInputProps = ArrayOfObjectsInputProps<GeopointItem> & {
  mapboxConfig: MapboxInputConfig
}

export function MultiGeopointInput(props: MultiGeopointInputProps) {
  const {
    changed,
    elementProps,
    focused,
    mapboxConfig: config,
    onChange,
    onItemAppend,
    onItemRemove,
    onPathFocus,
    path,
    readOnly,
    value,
  } = props

  const {
    id,
    ref: inputRef,
    onBlur: handleBlur,
    onFocus: handleFocus,
    'aria-describedby': ariaDescribedBy,
  } = elementProps

  const points = value || []
  const dialogId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeKey, setActiveKey] = useState<string | undefined>()

  const handleFocusButton = useCallback(
    () => inputRef?.current?.focus(),
    [inputRef]
  )

  const handleCloseModal = useCallback(() => {
    if (dialogRef.current) dialogRef.current.blur()
    setModalOpen(false)
    handleFocusButton()
  }, [handleFocusButton])

  const handleToggleModal = useCallback(() => {
    setModalOpen((currentState) => !currentState)
  }, [])

  const handleAdd = useCallback(
    (latLng: LatLng) => {
      const key = createKey()

      onItemAppend({
        _key: key,
        _type: 'geopoint',
        lat: latLng.lat,
        lng: latLng.lng,
      })
      setActiveKey(key)
    },
    [onItemAppend]
  )

  const handleMove = useCallback(
    (key: string, latLng: LatLng) => {
      onChange([
        set(latLng.lat, [{ _key: key }, 'lat']),
        set(latLng.lng, [{ _key: key }, 'lng']),
      ])
    },
    [onChange]
  )

  const handleSelect = useCallback((key: string) => {
    setActiveKey(key)
  }, [])

  const handleRemoveSelected = useCallback(() => {
    if (!activeKey) {
      return
    }

    onItemRemove(activeKey)
    setActiveKey(undefined)
  }, [activeKey, onItemRemove])

  const handleClear = useCallback(() => {
    onChange(unset())
    setActiveKey(undefined)
  }, [onChange])

  useEffect(() => {
    if (activeKey && !points.some((point) => point._key === activeKey)) {
      setActiveKey(undefined)
    }
  }, [activeKey, points])

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
          <a href="https://www.sanity.io/docs/schema-types/geopoint-type">
            Geopoint type
          </a>{' '}
          needs a Mapbox access token.
        </Text>
        <Text size={1}>
          Pass a valid token as <code>apiKey</code> in your{' '}
          <code>mapboxInput</code> plugin config.
        </Text>
      </Stack>
    )
  }

  const hasPoints = points.length > 0

  return (
    <Stack gap={3}>
      {hasPoints && (
        <ChangeIndicator path={path} isChanged={changed} hasFocus={!!focused}>
          <img
            className="previewImage"
            src={getStaticImageUrl(points, config.apiKey)}
            alt={`${points.length} map location${points.length === 1 ? '' : 's'}`}
            onClick={handleFocusButton}
            onDoubleClick={handleToggleModal}
          />
        </ChangeIndicator>
      )}

      <Box>
        <Grid gridTemplateColumns={hasPoints ? 2 : 1} gap={3}>
          <Button
            aria-describedby={ariaDescribedBy}
            disabled={readOnly}
            icon={hasPoints ? EditIcon : undefined}
            id={id}
            mode="ghost"
            onClick={handleToggleModal}
            onFocus={handleFocus}
            padding={3}
            ref={inputRef}
            text={hasPoints ? 'Edit' : 'Set locations'}
          />

          {hasPoints && (
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
          header="Place markers on the map"
          id={`${dialogId}_dialog`}
          onBlur={handleBlur}
          onClose={handleCloseModal}
          ref={dialogRef}
          width={1}
        >
          <Stack gap={3}>
            <div className="dialogInner">
              <MultiGeopointSelect
                apiKey={config.apiKey}
                value={points}
                activeKey={activeKey}
                onSelect={readOnly ? undefined : handleSelect}
                onAdd={readOnly ? undefined : handleAdd}
                onMove={readOnly ? undefined : handleMove}
                defaultLocation={config.defaultLocation}
                defaultZoom={config.defaultZoom}
                mapStyle={config.mapStyle}
              />
            </div>
            <Flex
              align="center"
              justify="space-between"
              padding={3}
              paddingTop={0}
            >
              <Text size={1} muted>
                {points.length === 0
                  ? 'Click the map to add a marker'
                  : `${points.length} location${points.length === 1 ? '' : 's'} · click a marker to select`}
              </Text>
              <Button
                disabled={readOnly || !activeKey}
                icon={TrashIcon}
                mode="ghost"
                onClick={handleRemoveSelected}
                text="Remove selected"
                tone="critical"
              />
            </Flex>
          </Stack>
        </Dialog>
      )}
    </Stack>
  )
}
