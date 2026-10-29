const {showIncompatiblePluginDialog} = require('@sanity/incompatible-plugin')
const {name, version} = require('./package.json')

export default showIncompatiblePluginDialog({
  name: name,
  versions: {
    v3: version,
    v2: '0.0.3',
  },
})
