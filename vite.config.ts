import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const isSparkEnv = !!process.env.GITHUB_SPARK

// https://vite.dev/config/
export default defineConfig(async () => {
  const sparkPlugins: PluginOption[] = []

  if (isSparkEnv) {
    const { default: sparkPlugin } = await import("@github/spark/spark-vite-plugin")
    const { default: createIconImportProxy } = await import("@github/spark/vitePhosphorIconProxyPlugin")
    sparkPlugins.push(createIconImportProxy() as PluginOption)
    sparkPlugins.push(sparkPlugin() as PluginOption)
  }

  return {
  plugins: [
    react(),
    tailwindcss(),
    ...sparkPlugins,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          'icons': ['@phosphor-icons/react'],
          'charts': ['recharts'],
        },
      },
    },
  },
  }
});
