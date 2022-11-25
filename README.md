# sanity-plugin-mapbox-input

Sanity plugin providing input handlers for geo-related input types using Mapbox. 
This plugin replaces the native Sanity `geopoint` type.

:warning: The plugin doesn't seem to work anymore due to some incompatibility with latest Sanity Studio. Please see `sanity-plugin-leaflet-input` as an alternative. :warning:


## Installation

- `sanity install mapbox-input`

- Then write a valid Mapbox API token into `./config/mapbox-input.json`

- `npm start`

## Usage
Use the `geopoint` type in your schema. Ex:

```js
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
  ],
}
```

## Screenshot

<p hidden align="center">
  <img src="https://user-images.githubusercontent.com/527559/86034638-5fa3c480-ba11-11ea-99d8-5b28aaf24817.jpg" width="520"  alt="Sanity Mapbox Input Plugin" />
</p>

## Related projects

https://github.com/rexxars/sanity-plugin-leaflet-input
