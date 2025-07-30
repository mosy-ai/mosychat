import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    config.experiments = { 
      ...config.experiments, 
      topLevelAwait: true 
    }
    
    // Handle node: scheme imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:(.*)$/,
        (resource: any) => {
          resource.request = resource.request.replace(/^node:/, '')
        }
      )
    )

    // Provide fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: require.resolve('path-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
    }

    return config
  },
  serverExternalPackages: ['lowdb']
}

export default nextConfig