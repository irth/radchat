module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  plugins: ['react', 'jsx-a11y', 'import'],
  env: { browser: true },
  rules: {
    'react/prop-types': 0,
    'react/require-default-props': 0,
  },
};
