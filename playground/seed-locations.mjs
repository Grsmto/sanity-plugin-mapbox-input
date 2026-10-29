import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {resolve, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '.env')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i), line.slice(i + 1)]
    })
)

const configPath = resolve(homedir(), '.config/sanity/config.json')
const {authToken} = JSON.parse(readFileSync(configPath, 'utf8'))

const client = createClient({
  projectId: env.SANITY_STUDIO_PROJECT_ID,
  dataset: env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: authToken,
  useCdn: false,
})

const id = process.argv[2] || 'b64c2c97-b4a9-4e24-808f-a328f90f67be'
const draftId = `drafts.${id}`

const locations = [
  {_key: 'locParis', _type: 'geopoint', lat: 48.8566, lng: 2.3522},
  {_key: 'locLondon', _type: 'geopoint', lat: 51.5074, lng: -0.1278},
  {_key: 'locBerlin', _type: 'geopoint', lat: 52.52, lng: 13.405},
]

const existing = await client.fetch(`*[_id in [$id, $draftId]]._id`, {
  id,
  draftId,
})

if (!existing.length) {
  throw new Error(`Document ${id} not found`)
}

const patchId = existing.includes(draftId) ? draftId : id

await client.patch(patchId).set({locations}).commit()

console.log(`Seeded ${locations.length} locations on ${patchId}`)
