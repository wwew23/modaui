const express = require('express')
const bodyParser = require('body-parser')

const authRoutes = require('./routes/auth')
const storesRoutes = require('./routes/stores')
const aiRoutes = require('./routes/ai')
const templatesRoutes = require('./routes/templates')
const componentsRoutes = require('./routes/components')
const productsRoutes = require('./routes/products')
const collectionsRoutes = require('./routes/collections')
const themesRoutes = require('./routes/themes')
const themeImporterRoutes = require('./routes/theme-importer')
const agentsRoutes = require('./routes/agents')
const osRoutes = require('./routes/os')
const osStreamRoutes = require('./routes/os-stream').default || require('./routes/os-stream')

const app = express()
app.use(bodyParser.json())

app.use('/api/auth', authRoutes)
app.use('/api/stores', storesRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/templates', templatesRoutes)
app.use('/api/components', componentsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/stores/:store_id/theme', themesRoutes)
app.use('/api/themes', themeImporterRoutes)
app.use('/api/agents', agentsRoutes)
app.use('/api/os', osRoutes)
app.use('/api/os/stream', osStreamRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

const port = process.env.PORT || 4000
const server = app.listen(port, () => console.log(`modaui API listening on ${port}`))

// Initialize OS WebSocket Stream
require('ts-node').register({ 
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true,
    moduleResolution: 'node'
  }
});
const { setupOSWebSocket } = require('./commerce-os/websocket');
setupOSWebSocket(server);

