import {useCallback, useMemo, useRef, useState, type FormEvent} from 'react'
import {Box, Button, Card, Checkbox, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {GeopointInput, type GeopointInputProps} from '../../src/input/GeopointInput'
import type {Geopoint, LatLng} from '../../src/types'

const SCHEMA_TYPE = {
  name: 'geopoint',
  title: 'Geopoint',
  jsonType: 'object',
  fields: [],
} as GeopointInputProps['schemaType']

function applyPatches(value: Geopoint | undefined, patches: unknown[]): Geopoint | undefined {
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
      next = {...(p.value as Geopoint)}
      continue
    }

    if (p.type === 'set' && p.path?.[0] === 'lat') {
      next = {
        _type: 'geopoint',
        ...(next || {lng: 0}),
        lat: p.value as number,
      }
      continue
    }

    if (p.type === 'set' && p.path?.[0] === 'lng') {
      next = {
        _type: 'geopoint',
        ...(next || {lat: 0}),
        lng: p.value as number,
      }
    }
  }

  return next
}

export function App() {
  const tokenFromEnv = (import.meta.env.VITE_MAPBOX_TOKEN as string) || ''

  const [apiKey, setApiKey] = useState(tokenFromEnv)
  const [useApiKey, setUseApiKey] = useState(Boolean(tokenFromEnv))
  const [value, setValue] = useState<Geopoint | undefined>(undefined)
  const [focused, setFocused] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const inputRef = useRef<HTMLButtonElement | null>(null)

  const appendLog = useCallback((message: string) => {
    setLog((current) => [`${new Date().toLocaleTimeString()} ${message}`, ...current].slice(0, 20))
  }, [])

  const onChange = useCallback(
    (patch: unknown) => {
      const patches = Array.isArray(patch) ? patch : [patch]

      setValue((current) => {
        const next = applyPatches(current, patches as unknown[])

        appendLog(`onChange → ${JSON.stringify(next ?? null)}`)
        console.log('[harness] onChange', next)

        return next
      })
    },
    [appendLog],
  )

  const onPathFocus = useCallback(
    (path: Array<string | number>) => {
      appendLog(`onPathFocus → ${JSON.stringify(path)}`)
    },
    [appendLog],
  )

  const elementProps = useMemo(
    () => ({
      id: 'harness-geopoint',
      ref: inputRef,
      onBlur: () => setFocused(false),
      onFocus: () => setFocused(true),
      'aria-describedby': undefined as string | undefined,
    }),
    [],
  )

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
    mapboxConfig: {
      apiKey: useApiKey ? apiKey : '',
      defaultZoom: 11,
      defaultLocation: {lat: 40.7058254, lng: -74.1180863} satisfies LatLng,
    },
  } as unknown as GeopointInputProps

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
    <Box padding={4} style={{maxWidth: 720, margin: '0 auto'}}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Text size={3} weight="semibold">
            GeopointInput harness
          </Text>
          <Text size={1} muted>
            Sanity-free mount of the plugin input. Token loaded from playground/.env when present.
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
                <label htmlFor="use-api-key">Pass apiKey (uncheck to test missing-key message)</label>
              </Text>
            </Flex>
            <TextInput
              value={apiKey}
              onChange={(event) => setApiKey(event.currentTarget.value)}
              placeholder="Mapbox access token"
              disabled={!useApiKey}
            />
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
          </Stack>
        </Card>

        <Card padding={3} radius={2} shadow={1} border>
          <GeopointInput {...props} />
        </Card>

        <Card padding={3} radius={2} tone="transparent" border>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              Current value
            </Text>
            <Text size={1} style={{fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
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
                <Text key={`${index}-${entry}`} size={1} style={{fontFamily: 'monospace'}}>
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
