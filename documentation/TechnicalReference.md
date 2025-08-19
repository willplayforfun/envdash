# Environmental Dashboard - Technical Reference

## Notes for LLM Context & Analysis

Before suggesting changes, understand these architectural decisions are intentional:

**"This is a standard Create React App setup"** - Wrong. Manually created React files without CRA scaffolding. Check `package.json` for missing CRA configurations.

**"The absolute Docker paths `/app/src/Config` are a hack"** - Wrong. Intentional choice for container consistency. These paths work reliably and avoid relative path complexity.

**"You need a proxy or CORS setup"** - Wrong. Direct API URL approach works without proxy complications. Cleaner and more explicit about endpoints.

**"Mixed module systems are a problem"** - Wrong. Dynamic import solution is elegant and intentional. Allows config sharing without forcing entire project to one module system.

**"Data should be fetched from APIs in real-time"** - Wrong. Static file preprocessing is better for performance, reliability, and offline capability.

**"Server should use ES modules for consistency"** - Wrong. CommonJS might be intentional for Node.js package compatibility and deployment environment requirements.

Key analysis points: Check package.json structure, Docker configuration details, and error handling patterns before suggesting architectural changes.

---

## Tech Stack
React 18 + React Router + Tailwind CSS + React-Leaflet. Express server with CORS and nodemon. Docker Compose with volume mounts. Data sources include Natural Earth GeoJSON boundaries, EPA air quality, CDC heat data - preprocessed and served via REST APIs.

## Critical Gotchas

**Module conflicts**: Server uses CommonJS, React uses ES modules. Shared config in `/cfg/datasets.js` accessed via dynamic import in Express: `const { DATASETS } = await import('/app/cfg/datasets.js')` with caching. React gets build-time copy to `src/config/datasets.js`. Never add `"type": "module"` to package.json - breaks Express compatibility.

**Docker development**: File watching needs `CHOKIDAR_USEPOLLING=true` and `WATCHPACK_POLLING=true`. Volume mounts: `./src:/app/src`, `./server:/app/server`, `./cfg:/app/cfg`. React dev server on 3000, Express API on 3001.

**Nodemon setup**: Auto-restart Express on code changes. Critical: `"ignore": ["public/data/*"]` prevents restarts during data downloads. Only watch `server/` and `cfg/` directories.

**React Strict Mode**: Causes double `useEffect` execution in development only. Add cleanup flags or `useRef` to prevent duplicate API calls. Never make useEffect async directly - create async function inside.

**Local storage limits**: Browser localStorage limited to ~5-10MB. Natural Earth files exceed this quickly. Solution: server-side downloads to filesystem, React triggers via fetch.

**Environment variables**: React requires `REACT_APP_*` prefix. API base: `process.env.REACT_APP_API_URL || 'http://localhost:3001'`. Set `REACT_APP_API_URL=http://localhost:3001` in docker-compose. Package.json proxy doesn't support env variable expansion. Express uses `cors()` middleware instead of React proxy.

**File operations**: Check existence with `await fs.access(filePath)` (throws if missing). Create directories with `await fs.mkdir(dataDir, { recursive: true })`. Build paths with `path.join(__dirname, '../public/data', filename)`.

## Architecture

**Server Role**: Express server acts as a data processing and API layer, not just static file serving. Handles environmental data calculations, geographic summaries, boundary processing, and cross-referenced problem/cause relationships. Services are modular (DataService, BoundaryService) with dedicated routers.

**Config system**: Single source in `cfg/datasets.js` as ES module. Express accesses via dynamic import with caching. React imports build-time copy.

```javascript
// cfg/datasets.js
export const DATASETS = {
  NATURAL_EARTH: {
    name: "Natural Earth Boundaries",
    downloads: [{ url, filename, description }]
  }
};

// Express (with caching)
let CONFIG_CACHE = null;
const loadConfig = async () => {
  if (!CONFIG_CACHE) {
    CONFIG_CACHE = await import('/app/cfg/datasets.js');
  }
  return CONFIG_CACHE;
};
```

**State management**: Enum for consistency: `READY`, `DOWNLOADING`, `SUCCESS`, `ERROR`. Dynamic state keys: `downloadStatus[datasetKey] = { state, message }`.

**Navigation**: Centralized routes in `src/NavConfig.js`. MAP: `/map`, DATA: `/data`.

**File structure**:
```
cfg/datasets.js           # ES module config (source of truth)
src/config/datasets.js    # Build-time copy for React
server/server.js          # Express API (CommonJS)
nodemon.json              # Ignores public/data/
public/data/              # Downloaded files
```

**Service Pattern**: Services bundle Express routes + logic in single classes. Server mounts via `app.use('/api/data', dataService.router)`. Routes are bound class methods.

**State Management**: Explicit prop passing over React Context. Custom hooks created at top level, passed as props. No browser storage allowed - React state only.

**Geographic Hierarchy**: Numerical levels (0=countries, 1=states, 2=counties). Parent codes: `"US"`, `"US-CA"`, `"US-CA-037"`. API: `/api/boundaries/:level/:parentCode?`

**API Design**: RESTful endpoints for different data types. Current: `/api/data` for dataset management, `/api/boundaries` for geographic data. Future: endpoints for environmental problems, causes, QALY calculations, and cross-referenced content. Dataset keys in URL (required, no defaults). Boolean status fields. Minimal responses - strip unnecessary data. Proper HTTP codes.

## Development

**Commands**:
```bash
docker-compose up                    # Full stack with hot reload
docker-compose build --progress=plain 2>&1 | tee build.log
docker-compose restart app
docker-compose logs -f app           # View container logs
```

**Build process**: Copy config before start via npm scripts:
```bash
"copy-config": "mkdir -p src/config && cp cfg/datasets.js src/config/",
"prestart": "npm run copy-config",
"server": "nodemon server/server.js --watch server --watch cfg"
```

## API

**Current Endpoints**: 
- `POST /api/download` - Dataset management (download/check status)
- `GET /api/boundaries/:level/:parentCode?` - Geographic boundary data

**Data Management**: `POST /api/download`
Download: `{ "method": "download", "datasetKey": "NATURAL_EARTH" }`
Check: `{ "method": "check", "datasetKey": "NATURAL_EARTH" }`
Response: `{ success: boolean, message: string, files?: [] }`

**Future Endpoints** (planned):
- `/api/problems/:problemId?` - Environmental problems with QALY data
- `/api/causes/:causeId?` - Problem causes and relationships  
- `/api/summaries/:location` - Geographic health impact summaries
- `/api/primers/:primerId?` - Educational content and research explanations

**Frontend pattern**:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const response = await fetch(`${API_BASE_URL}/api/download`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ method: "download", datasetKey })
});
```