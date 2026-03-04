import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            // ✅ Required for react-native-reanimated v3
            'react-native-reanimated/plugin',
          ],
        },
      }),
      tailwindcss(),
      {
        name: 'reanimated-jsx-loader',
        enforce: 'pre',
        async transform(code, id) {
          if (id.includes('react-native-reanimated') && id.endsWith('.js')) {
            return transformWithEsbuild(code, id, { loader: 'jsx' });
          }
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Some RN libraries check this at compile time
      __DEV__: JSON.stringify(mode !== 'production'),
    },
    resolve: {
      // ────────────────────────────────────────────────────────────────────────
      // CONDITION ORDERING: Tell esbuild to prefer the 'browser' export
      // condition over 'require'/'node'. This ensures libraries like
      // react-native-gesture-handler pick up their web/browser entry points
      // rather than the native entry points.
      // ────────────────────────────────────────────────────────────────────────
      conditions: ['browser', 'module', 'main'],

      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, '.'),
        },
        // ── Core: redirect react-native to react-native-web ──────────────────
        {
          find: 'react-native',
          replacement: 'react-native-web',
        },
        // ── Stub 1: AppContainer (react-native-screens) ──────────────────────
        {
          find: 'react-native/Libraries/ReactNative/AppContainer',
          replacement: path.resolve(__dirname, 'src/web-stubs/AppContainer.tsx'),
        },
        // ── Stub 2: ReactFabricPublicInstance (react-native-gesture-handler) ─
        {
          find: 'react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance',
          replacement: path.resolve(__dirname, 'src/web-stubs/ReactFabricPublicInstance.ts'),
        },
        // ── Stub 3: PressabilityDebug (react-native-gesture-handler) ─────────
        {
          find: 'react-native/Libraries/Pressability/PressabilityDebug',
          replacement: path.resolve(__dirname, 'src/web-stubs/PressabilityDebug.tsx'),
        },
        // ── Stub 4: ReactNativeViewConfigRegistry (react-native-gesture-handler)
        {
          find: 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry',
          replacement: path.resolve(__dirname, 'src/web-stubs/ReactNativeViewConfigRegistry.ts'),
        },
        // ── Additional stubs — add these proactively to prevent future errors ─
        {
          find: 'react-native/Libraries/Animated/NativeAnimatedHelper',
          replacement: path.resolve(__dirname, 'src/web-stubs/NativeAnimatedHelper.ts'),
        },
        {
          find: 'react-native/Libraries/BatchedBridge/NativeModules',
          replacement: path.resolve(__dirname, 'src/web-stubs/NativeModules.ts'),
        },
      ],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    },

    // ────────────────────────────────────────────────────────────────────────────
    // OPTIMIZEDEPS: Fix JSX transpilation errors in react-native-reanimated.
    // ────────────────────────────────────────────────────────────────────────────
    optimizeDeps: {
      include: [
        'react-native-reanimated',
        'react-native-gesture-handler',
      ],
      esbuildOptions: {
        // ✅ Treat .js files from Reanimated as JSX
        loader: {
          '.js': 'jsx',
        },
        // ✅ Apply the react-native → react-native-web alias inside esbuild too
        alias: {
          'react-native': 'react-native-web',
        },
        // ✅ Inject the JSX pragma so Reanimated's JSX resolves to React.createElement
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        define: {
          __DEV__: JSON.stringify(mode !== 'production'),
          'process.env.NODE_ENV': JSON.stringify(mode),
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────────────
    // BUILD: Tell the main build pipeline to also handle JSX in node_modules.
    // ────────────────────────────────────────────────────────────────────────────
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress "use client" directive warnings from RN libraries
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      fs: {
        // Allow serving files from the node_modules stubs
        allow: ['..'],
      },
    },
  };
});
