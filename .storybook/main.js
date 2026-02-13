

/** @type { import('@storybook/server-webpack5').StorybookConfig } */
const config = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(json|yaml|yml)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  staticDirs: ['../sw/', '../app/node_modules'],
  framework: "@storybook/server-webpack5",
  "core": {
    // Webpack Encore uses webpack5
    "builder": "@storybook/builder-webpack5"
  }
};
export default config;