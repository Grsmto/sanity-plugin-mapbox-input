import {defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'geopoint',
    }),
    defineField({
      name: 'locations',
      title: 'Locations',
      description: 'Multiple geopoints on a single Mapbox map (click to add markers).',
      type: 'array',
      of: [{type: 'geopoint'}],
      initialValue: [
        {_key: 'locParis', _type: 'geopoint', lat: 48.8566, lng: 2.3522},
        {_key: 'locLondon', _type: 'geopoint', lat: 51.5074, lng: -0.1278},
        {_key: 'locBerlin', _type: 'geopoint', lat: 52.52, lng: 13.405},
      ],
    }),
  ],
})
