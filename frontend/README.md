# Sprint Form Analyzer: frontend

React + TypeScript + Vite + Tailwind. Runs against mocked API responses (MSW)
until the backend exists.

```bash
npm install
npm run dev     # http://localhost:5173, mocks enabled in dev
npm test        # Vitest
npm run build   # type-check + production build
npm run lint    # oxlint
```

- Data contract: `src/types/run.ts` (Zod). The backend must return this shape.
- Mock run: `src/mocks/fixtures/run.ts` (deterministic, synthetic).
- Run Viewer: `/runs/mock-1`. Load any local video with the file picker; it is
  played from an object URL and never uploaded.
- Set `VITE_USE_MOCKS=true` to enable mocks in a production build.
