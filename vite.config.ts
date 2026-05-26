import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // ── Strategy ────────────────────────────────────────────────────────
      // GenerateSW: Workbox generates the entire SW — no custom SW file needed.
      strategies: 'generateSW',

      // ── SW filename ──────────────────────────────────────────────────────
      // Matches the no-cache rules already in nginx.conf and vercel.json.
      filename: 'sw.js',

      // ── Registration type ────────────────────────────────────────────────
      // 'prompt': new SW downloads silently but does NOT auto-activate.
      // The PwaUpdatePrompt component detects the waiting SW and lets the
      // user manually trigger the update. No surprise reloads.
      //
      // IMPORTANT: 'autoUpdate' forces skipWaiting() + clientsClaim() into
      // the generated SW and adds a NavigationRoute (offline fallback).
      // Both are forbidden for this online-only ERP. Use 'prompt' instead.
      registerType: 'prompt',

      // ── Manifest ─────────────────────────────────────────────────────────
      // manifest.json already exists in public/ from Phase 2.
      // Setting false prevents vite-plugin-pwa from generating a duplicate.
      manifest: false,

      // ── Dev mode ─────────────────────────────────────────────────────────
      // SW is disabled in development — prevents confusing cache behavior
      // during hot-module replacement and API development.
      devOptions: {
        enabled: false,
      },

      // ── Workbox options ──────────────────────────────────────────────────
      workbox: {
        // ── skipWaiting: false ─────────────────────────────────────────────
        // New SW waits until the user manually triggers the update via
        // PwaUpdatePrompt. Prevents mid-session reloads and chunk mismatches.
        skipWaiting: false,

        // ── clientsClaim: false ────────────────────────────────────────────
        // New SW does not immediately claim existing tabs on activation.
        // The page that triggered the update will reload cleanly.
        clientsClaim: false,

        // ── Navigation preload ─────────────────────────────────────────────
        // Allows the browser to start a network request for navigation
        // in parallel with SW boot — reduces navigation latency.
        // Safe because we have NO navigateFallback (online-only app).
        navigationPreload: true,

        // ── Precache glob patterns ─────────────────────────────────────────
        // Only precache the app shell and small static assets.
        // The large PDF generator chunk (1.8 MB) is excluded — it is fetched
        // on demand and cached by the runtimeCaching rule below.
        globPatterns: [
          '**/*.{js,css,html}',
          'icon-*.png',
          'apple-touch-icon.png',
        ],

        // Exclude from precaching:
        //   - invoicePdfGenerator: 1.8 MB, fetched on demand via NetworkFirst
        //   - workbox runtime: handled separately by the plugin
        //   - index.html: MUST be excluded to prevent GenerateSW from injecting
        //     a NavigationRoute (offline fallback). This is an online-only app —
        //     navigation must fail normally when offline, not serve a cached shell.
        globIgnores: [
          '**/invoicePdfGenerator-*.js',
          '**/workbox-*.js',
          'index.html',
        ],

        // Cap individual precache entry size at 3 MB.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB

        // ── NO navigation fallback ─────────────────────────────────────────
        // This is an ONLINE-ONLY app. If the user is offline, navigation
        // should fail normally — no cached shell, no offline page.
        // Setting navigateFallback to empty string disables the NavigationRoute
        // that GenerateSW injects by default. Without this, Workbox would
        // serve cached index.html for all navigation requests when offline.
        navigateFallback: undefined,

        // ── Runtime caching rules ──────────────────────────────────────────
        // Order matters — first matching rule wins.
        runtimeCaching: [

          // ── RULE 1: ALL cross-origin requests → NetworkOnly ───────────────
          // The backend API lives on a different origin (Render/Docker).
          // All cross-origin requests — every API call, auth endpoint,
          // upload, health check, and WebSocket upgrade — pass through
          // to the network with zero SW involvement.
          //
          // This single rule protects:
          //   POST /auth/login, /auth/refresh, /auth/logout
          //   GET/POST/PATCH/DELETE to all API endpoints
          //   /uploads/* (access-controlled user files)
          //   /socket.io/* (WebSocket — SW cannot intercept WS anyway)
          //   /notifications, /chat WebSocket namespaces
          //
          // withCredentials requests (cookies + Authorization header) pass
          // through unchanged — the SW never reads or modifies auth headers.
          {
            urlPattern: ({ sameOrigin }) => !sameOrigin,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'cross-origin-never-cache',
            },
          },

          // ── RULE 2: PDF generator chunk → NetworkFirst, 30-day cache ──────
          // The invoicePdfGenerator chunk is excluded from precaching.
          // Cache it on first use so subsequent PDF operations don't
          // re-download 1.8 MB. NetworkFirst ensures updates are picked
          // up on next deployment.
          {
            urlPattern: /\/assets\/invoicePdfGenerator-.*\.js$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pdf-chunk-cache',
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                maxEntries: 2,
              },
              networkTimeoutSeconds: 10,
            },
          },

          // ── RULE 3: Hashed JS/CSS assets → CacheFirst ─────────────────────
          // Vite content-hashes all built assets. A hash change = new URL =
          // new cache entry. CacheFirst is safe because the hash guarantees
          // the cached version is always correct for that URL.
          {
            urlPattern: /\/assets\/.*\.(js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                maxEntries: 50,
              },
            },
          },

          // ── RULE 4: PWA icons and images → CacheFirst ─────────────────────
          // Icons have stable filenames and rarely change.
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|ico|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                maxEntries: 30,
              },
            },
          },
        ],

        // ── Cleanup ────────────────────────────────────────────────────────
        // Remove precache entries from previous deployments automatically.
        cleanupOutdatedCaches: true,

        // ── Source maps ────────────────────────────────────────────────────
        sourcemap: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
