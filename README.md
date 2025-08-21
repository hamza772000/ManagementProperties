# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
## Static property data generation

During `npm run build` a script (`scripts/generate-properties.mjs`) runs that queries the database for active properties and writes `public/properties-generated.json`. The public site loads this file instead of calling the runtime `/api/properties` endpoint, giving faster first paint & fewer cold starts.

If `DATABASE_URL` is missing at build time the script writes an empty array so builds never fail.

### Updating the static snapshot

1. Use the Admin page to add / edit / hide properties.
2. Click the "Update latest settings" button (new) which calls `/api/redeploy`.
3. That endpoint posts to your `DEPLOY_HOOK_URL` (set in environment) triggering a new Vercel deployment.
4. The new build regenerates `properties-generated.json` and the site serves updated data.

### Required environment variables

* `DATABASE_URL` – Postgres connection string.
* `ADMIN_TOKEN` – Token protecting admin endpoints.
* `DEPLOY_HOOK_URL` – Vercel Deploy Hook (Project Settings > Git > Deploy Hooks).

### Local development

`npm run dev` does NOT regenerate automatically on DB changes; re-run `npm run generate:properties` (or a full build) to refresh the JSON locally.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Commercial status migration

If you encounter a Postgres error like `violates check constraint "properties_status_check"` after adding a property with status `commercial`, update the DB constraint to allow the new status:

```
npm run migrate:commercial
```

This drops and recreates the check constraint to include `'commercial'`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.chaname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rule s for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other opti ons...
    },
  },
])
```
