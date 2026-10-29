import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import { GeopointInput, type GeopointInputProps } from '../../src/GeopointInput'
import {
  MultiGeopointInput,
  type MultiGeopointInputProps,
} from '../../src/MultiGeopointInput'
import type { Geopoint, GeopointItem, LatLng } from '../../src/types'

const SCHEMA_TYPE = {
  name: 'geopoint',
  title: 'Geopoint',
  jsonType: 'object',
  fields: [],
} as GeopointInputProps['schemaType']

const ARRAY_SCHEMA_TYPE = {
  name: 'locations',
  title: 'Locations',
  jsonType: 'array',
  of: [SCHEMA_TYPE],
} as MultiGeopointInputProps['schemaType']

const EXAMPLE_LOCATIONS: GeopointItem[] = [
  {_key: 'locParis', _type: 'geopoint', lat: 48.8566, lng: 2.3522},
  {_key: 'locLondon', _type: 'geopoint', lat: 51.5074, lng: -0.1278},
  {_key: 'locBerlin', _type: 'geopoint', lat: 52.52, lng: 13.405},
]

function applyPatches(
  value: Geopoint | undefined,
  patches: unknown[]
): Geopoint | undefined {
  let next = value

  for (const patch of patches) {
    const p = patch as {
      type?: string
      path?: Array<string | number>
      value?: unknown
    }

    if (p.type === 'unset' && (!p.path || p.path.length === 0)) {
      next = undefined
      continue
    }

    if (p.type === 'setIfMissing' && !next) {
      next = { ...(p.value as Geopoint) }
      continue
    }

    if (p.type === 'set' && p.path?.[0] === 'lat') {
      next = {
        _type: 'geopoint',
        ...(next || { lng: 0 }),
        lat: p.value as number,
      }
      continue
    }

    if (p.type === 'set' && p.path?.[0] === 'lng') {
      next = {
        _type: 'geopoint',
        ...(next || { lat: 0 }),
        lng: p.value as number,
      }
    }
  }

  return next
}

function applyArrayPatches(
  value: GeopointItem[] | undefined,
  patches: unknown[]
): GeopointItem[] | undefined {
  let next = value

  for (const patch of patches) {
    const p = patch as {
      type?: string
      path?: Array<string | number | {_key: string}>
      value?: unknown
      items?: GeopointItem[]
      position?: string
    }

    if (p.type === 'unset' && (!p.path || p.path.length === 0)) {
      next = undefined
      continue
    }

    if (p.type === 'set' && (!p.path || p.path.length === 0)) {
      next = p.value as GeopointItem[]
      continue
    }

    if (p.type === 'insert' && p.items?.length) {
      const current = next || []
      next = [...current, ...p.items]
      continue
    }

    if (p.type === 'set' && p.path?.length === 2) {
      const keySeg = p.path[0]
      const field = p.path[1]
      const key =
        typeof keySeg === 'object' && keySeg && '_key' in keySeg
          ? keySeg._key
          : undefined

      if (!key || (field !== 'lat' && field !== 'lng')) {
        continue
      }

      next = (next || []).map((point) =>
        point._key === key ? {...point, [field]: p.value as number} : point
      )
      continue
    }

    if (p.type === 'unset' && p.path?.length === 1) {
      const keySeg = p.path[0]
      const key =
        typeof keySeg === 'object' && keySeg && '_key' in keySeg
          ? keySeg._key
          : undefined

      if (!key) {
        continue
      }

      const filtered = (next || []).filter((point) => point._key !== key)
      next = filtered.length ? filtered : undefined
    }
  }

  return next
}

export function App() {
  const tokenFromEnv = (import.meta.env.VITE_MAPBOX_TOKEN as string) || ''

  const [apiKey, setApiKey] = useState(tokenFromEnv)
  const [useApiKey, setUseApiKey] = useState(Boolean(tokenFromEnv))
  const [value, setValue] = useState<Geopoint | undefined>(undefined)
  const [locations, setLocations] = useState<GeopointItem[] | undefined>(
    EXAMPLE_LOCATIONS
  )
  const [focused, setFocused] = useState(false)
  const [locationsFocused, setLocationsFocused] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const inputRef = useRef<HTMLButtonElement | null>(null)
  const locationsInputRef = useRef<HTMLButtonElement | null>(null)

  const appendLog = useCallback((message: string) => {
    setLog((current) =>
      [`${new Date().toLocaleTimeString()} ${message}`, ...current].slice(0, 20)
    )
  }, [])

  const onChange = useCallback(
    (patch: unknown) => {
      const patches = Array.isArray(patch) ? patch : [patch]

      setValue((current) => {
        const next = applyPatches(current, patches as unknown[])

        appendLog(`geopoint onChange → ${JSON.stringify(next ?? null)}`)
        console.log('[harness] onChange', next)

        return next
      })
    },
    [appendLog]
  )

  const onLocationsChange = useCallback(
    (patch: unknown) => {
      const patches = Array.isArray(patch) ? patch : [patch]

      setLocations((current) => {
        const next = applyArrayPatches(current, patches as unknown[])

        appendLog(`locations onChange → ${JSON.stringify(next ?? null)}`)
        console.log('[harness] locations onChange', next)

        return next
      })
    },
    [appendLog]
  )

  const onPathFocus = useCallback(
    (path: Array<string | number>) => {
      appendLog(`onPathFocus → ${JSON.stringify(path)}`)
    },
    [appendLog]
  )

  const elementProps = useMemo(
    () => ({
      id: 'harness-geopoint',
      ref: inputRef,
      onBlur: () => setFocused(false),
      onFocus: () => setFocused(true),
      'aria-describedby': undefined as string | undefined,
    }),
    []
  )

  const locationsElementProps = useMemo(
    () => ({
      id: 'harness-locations',
      ref: locationsInputRef,
      onBlur: () => setLocationsFocused(false),
      onFocus: () => setLocationsFocused(true),
      'aria-describedby': undefined as string | undefined,
    }),
    []
  )

  const mapboxConfig = {
    apiKey: useApiKey ? apiKey : '',
    defaultZoom: 11,
    defaultLocation: { lat: 40.7058254, lng: -74.1180863 } satisfies LatLng,
  }

  const props = {
    changed: Boolean(value),
    elementProps,
    focused,
    id: 'harness-geopoint',
    level: 0,
    onChange,
    onPathFocus,
    path: ['location'],
    presence: [],
    readOnly: false,
    renderDefault: () => null,
    schemaType: SCHEMA_TYPE,
    validation: [],
    value,
    mapboxConfig,
  } as unknown as GeopointInputProps

  const locationsProps = {
    changed: Boolean(locations?.length),
    elementProps: locationsElementProps,
    focused: locationsFocused,
    id: 'harness-locations',
    level: 0,
    onChange: onLocationsChange,
    onItemAppend: (item: GeopointItem) => {
      setLocations((current) => {
        const next = [...(current || []), item]
        appendLog(`locations append → ${JSON.stringify(next)}`)
        return next
      })
    },
    onItemRemove: (key: string) => {
      setLocations((current) => {
        const filtered = (current || []).filter((point) => point._key !== key)
        const next = filtered.length ? filtered : undefined
        appendLog(`locations remove → ${JSON.stringify(next ?? null)}`)
        return next
      })
    },
    onPathFocus,
    path: ['locations'],
    presence: [],
    readOnly: false,
    renderDefault: () => null,
    schemaType: ARRAY_SCHEMA_TYPE,
    validation: [],
    value: locations,
    mapboxConfig,
  } as unknown as MultiGeopointInputProps

  const handleSeed = (event: FormEvent) => {
    event.preventDefault()
    const seeded: Geopoint = {
      _type: 'geopoint',
      lat: 48.8566,
      lng: 2.3522,
    }

    setValue(seeded)
    appendLog(`seed → ${JSON.stringify(seeded)}`)
  }

  return (
    <Box padding={4} style={{ maxWidth: 720, margin: '0 auto' }}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Text size={3} weight="semibold">
            Mapbox input harness
          </Text>
          <Text size={1} muted>
            Sanity-free mounts of single and multi-point inputs. Token loaded
            from playground/.env when present.
          </Text>
        </Stack>

        <Card padding={3} radius={2} shadow={1} tone="transparent">
          <Stack gap={3}>
            <Flex align="center" gap={2}>
              <Checkbox
                checked={useApiKey}
                id="use-api-key"
                onChange={(event) => setUseApiKey(event.currentTarget.checked)}
              />
              <Text size={1}>
                <label htmlFor="use-api-key">
                  Pass apiKey (uncheck to test missing-key message)
                </label>
              </Text>
            </Flex>
            <TextInput
              value={apiKey}
              onChange={(event) => setApiKey(event.currentTarget.value)}
              placeholder="Mapbox access token"
              disabled={!useApiKey}
            />
          </Stack>
        </Card>

        <Stack gap={2}>
          <Text size={2} weight="semibold">
            Single geopoint
          </Text>
          <Card padding={3} radius={2} shadow={1} tone="transparent">
            <Flex gap={2}>
              <Button mode="ghost" text="Seed Paris" onClick={handleSeed} />
              <Button
                mode="ghost"
                text="Clear value"
                tone="critical"
                onClick={() => {
                  setValue(undefined)
                  appendLog('clear → null')
                }}
              />
            </Flex>
          </Card>
          <Card padding={3} radius={2} shadow={1} border>
            <GeopointInput {...props} />
          </Card>
        </Stack>

        <Stack gap={2}>
          <Text size={2} weight="semibold">
            Array of geopoints (one map)
          </Text>
          <Card padding={3} radius={2} shadow={1} tone="transparent">
            <Flex gap={2}>
              <Button
                mode="ghost"
                text="Seed Paris / London / Berlin"
                onClick={() => {
                  setLocations(EXAMPLE_LOCATIONS)
                  appendLog(`locations seed → ${JSON.stringify(EXAMPLE_LOCATIONS)}`)
                }}
              />
              <Button
                mode="ghost"
                text="Clear locations"
                tone="critical"
                onClick={() => {
                  setLocations(undefined)
                  appendLog('locations clear → null')
                }}
              />
            </Flex>
          </Card>
          <Card padding={3} radius={2} shadow={1} border>
            <MultiGeopointInput {...locationsProps} />
          </Card>
          <Card padding={3} radius={2} tone="transparent" border>
            <Stack gap={2}>
              <Text size={1} weight="semibold">
                Locations value
              </Text>
              <Text
                size={1}
                style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              >
                {JSON.stringify(locations ?? null, null, 2)}
              </Text>
            </Stack>
          </Card>
        </Stack>

        <Card padding={3} radius={2} tone="transparent" border>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              Current single value
            </Text>
            <Text
              size={1}
              style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
            >
              {JSON.stringify(value ?? null, null, 2)}
            </Text>
          </Stack>
        </Card>

        <Card padding={3} radius={2} tone="transparent" border>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              Event log
            </Text>
            {log.length === 0 ? (
              <Text size={1} muted>
                No events yet
              </Text>
            ) : (
              log.map((entry, index) => (
                <Text
                  key={`${index}-${entry}`}
                  size={1}
                  style={{ fontFamily: 'monospace' }}
                >
                  {entry}
                </Text>
              ))
            )}
          </Stack>
        </Card>
      </Stack>
    </Box>
  )
}
