# sanity-plugin-mapbox-input

Sanity Studio plugin that replaces the default `geopoint` input with an interactive Mapbox map.

> Requires Sanity Studio v3+. Compatible with `sanity` `^3 || ^4 || ^5 || ^6`.

## Installation

```sh
npm install sanity-plugin-mapbox-input
```

## Usage

Add the plugin in `sanity.config.ts` (or `.js`) with a valid [Mapbox access token](https://docs.mapbox.com/help/getting-started/access-tokens/):

```ts
import {defineConfig} from 'sanity'
import {mapboxInput} from 'sanity-plugin-mapbox-input'

export default defineConfig({
  // ...
  plugins: [
    mapboxInput({
      apiKey: 'pk.your-mapbox-token',
      defaultZoom: 11,
      defaultLocation: {lat: 40.7058254, lng: -74.1180863},
    }),
  ],
})
```

This plugin replaces the default `geopoint` input component. It also replaces the default array input when the array only contains `geopoint` items, so multiple points share a single map.

Use a `geopoint` field (or an array of them) in your schema:

```ts
export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'location',
      type: 'geopoint',
      title: 'Location',
    },
    {
      name: 'locations',
      type: 'array',
      title: 'Locations',
      of: [{type: 'geopoint'}],
    },
  ],
}
```

Stored values stay Sanity-native (`geopoint` / `array` of `geopoint`). No custom type or migration is required. Arrays that mix `geopoint` with other types keep Sanity’s default array UI.

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiKey` | `string` | required | Mapbox access token |
| `defaultZoom` | `number` | `8` | Initial zoom when opening the map dialog |
| `defaultLocation` | `{lat, lng}` | NYC-ish | Center used when no value is set |
| `mapStyle` | `string` | `mapbox://styles/mapbox/streets-v12` | Mapbox style URL |

Ensure the token allows:

- Mapbox GL JS / Styles
- Mapbox Geocoding API (search)
- Mapbox Static Images API (preview)

And that HTTP referrer restrictions include your Studio URL(s).

## Related

- [@sanity/google-maps-input](https://github.com/sanity-io/google-maps-input)
- [sanity-plugin-leaflet-input](https://github.com/rexxars/sanity-plugin-leaflet-input)

## License

MIT
