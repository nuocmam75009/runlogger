/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: import('autoprefixer'),
  },
};

export default config;
