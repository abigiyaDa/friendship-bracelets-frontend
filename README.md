# Friendship Bracelets Frontend

A React frontend for a handmade friendship bracelets shop. It currently provides an admin dashboard for managing the catalog, with a public storefront planned. It talks to a separate Django REST backend.

## Screenshots

<img width="1918" height="812" alt="image" src="https://github.com/user-attachments/assets/824094d9-7570-4485-aa29-c3769e063363" />


## Features

- Admin login with Django credentials using JWT access and refresh tokens.
- Automatic access-token refresh and redirect to the login page when authentication fails.
- Protected admin routes and dashboard layout.
- Dashboard placeholder at `/admin`.
- Categories management: list, create, edit and delete categories with name, optional slug and image.
- Colors management: list, create, edit and delete colors with name, hex code and availability.
- Pickup locations management: list, create, edit and delete locations with name, area, details and active status.
- Products management:
  - Paginated, searchable product list with status and category filters.
  - Create and edit product details, pricing, options, colors and lead time.
  - Multiple color selection with swatches.
  - Image upload while creating a product.
  - Image manager while editing: upload multiple images, set the primary image, reorder images and delete images.
  - Deactivate and restore products.
- Snackbar notifications, confirmation dialogs and backend validation errors on form fields.

## Tech stack

- React 19
- Vite
- Material UI (MUI) v9
- react-router-dom
- axios
- react-hook-form
- SWR

Supporting libraries already included by the template: Emotion, Ant Design Icons and MUI X Charts.

## Prerequisites

- Node.js v24 (Node 20+ recommended)
- npm or yarn
- git
- The Django REST backend, checked out next to this repository: `../friendship-bracelets` (repository URL: `<backend-repo-url>`)

## Getting started

1. Clone the repository and enter the project directory.

   ```bash
   git clone git@github.com:<your-username>/friendship-bracelets-frontend.git
   cd friendship-bracelets-frontend
   ```

2. Install dependencies.

   ```bash
   npm install --legacy-peer-deps
   ```

   The template's ESLint 10 setup conflicts with the peer dependency range of `eslint-plugin-jsx-a11y`, so npm may report `ERESOLVE` without this flag. This repository includes an `.npmrc` with `legacy-peer-deps=true`, so plain `npm install` also works. If the `.npmrc` file is removed, pass `--legacy-peer-deps` on every install.

3. Start the backend first.

   ```bash
   cd ../friendship-bracelets
   uv sync
   uv run python manage.py migrate
   uv run python manage.py createsuperuser
   uv run python manage.py runserver
   ```

   Plain Python alternative:

   ```bash
   cd ../friendship-bracelets
   python -m venv .venv
   source .venv/bin/activate
   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

   The admin dashboard logs in with this Django superuser. There is no registration flow.

4. Start the frontend in a separate terminal.

   ```bash
   cd ../friendship-frontend
   npm start
   ```

   Open `http://localhost:3000`.

5. Open `http://localhost:3000/admin/login` and log in with the superuser created above.

## Configuration

- The Vite dev server runs on port `3000`.
- `vite.config.mjs` proxies `/api` and `/media` to `http://127.0.0.1:8000`. Both must point at the Django backend.
- To use a different backend URL, change the `target` values for the `/api` and `/media` proxy entries in `vite.config.mjs`.
- `.env` contains:
  - `VITE_APP_VERSION` — application version label.
  - `VITE_APP_BASE_NAME` — Vite `base` path and React Router basename. Keep it as `/` for local development.
  - `PUBLIC_URL` — template value, currently not used by the Vite configuration.
  - `GENERATE_SOURCEMAP` — template value, currently not used by the Vite configuration.
- For production, the API base URL and CORS settings must be configured for the deployed backend. The axios client in `src/services/adminApi.js` uses the same-origin path `/api/admin`, so either serve the frontend behind the same domain/proxy or update the client and refresh URL.

## Available scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the Vite development server on port 3000. |
| `npm run build` | Create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Lint all JavaScript, JSX, TypeScript and TSX files in `src`. |
| `npm run lint:fix` | Run ESLint and apply automatic fixes. |
| `npm run prettier` | Format files in `src` with Prettier. |

## Routes

| Route | Access | Page |
| --- | --- | --- |
| `/` | Public | Redirects to `/admin`, which requires authentication. |
| `/admin/login` | Public | Admin login. |
| `/admin` | Protected | Dashboard placeholder. |
| `/admin/categories` | Protected | Categories management. |
| `/admin/colors` | Protected | Colors management. |
| `/admin/pickup-locations` | Protected | Pickup locations management. |
| `/admin/products` | Protected | Product list. |
| `/admin/products/new` | Protected | Create product. |
| `/admin/products/:id/edit` | Protected | Edit product and manage images. |

The `/login` and `/register` routes are commented out in `src/routes/LoginRoutes.jsx`. Storefront routes are not built yet.

## Project structure

```text
src/
├── admin/            Project-specific admin app
│   ├── api/          Axios calls for categories, colors, pickup locations and products
│   ├── auth/         Auth context, login page and protected route
│   ├── components/   Product image manager
│   └── pages/        Admin pages
├── services/         Project-specific admin axios client and token handling
├── routes/           React Router setup for admin and login routes
├── layout/           Dashboard and auth layouts (Mantis template)
├── menu-items/       Sidebar configuration (page.jsx and support.jsx are unused template leftovers)
├── themes/           MUI theme configuration (Mantis template)
├── pages/            Mostly leftover Mantis demo pages and the dashboard placeholder
└── sections/         Mostly leftover Mantis template sections
```

The public storefront is not built yet. When it is added, it is planned to live in `src/customer/`.

## Backend API used

The axios client base URL is `/api/admin`. Paths below are relative to that base.

| Area | Method | Path |
| --- | --- | --- |
| Auth | POST | `/auth/login/` |
| Auth | GET | `/auth/me/` |
| Auth | POST | `/auth/refresh/` |
| Categories | GET | `/categories/` |
| Categories | POST | `/categories/` |
| Categories | PATCH | `/categories/{id}/` |
| Categories | DELETE | `/categories/{id}/` |
| Colors | GET | `/colors/` |
| Colors | POST | `/colors/` |
| Colors | PATCH | `/colors/{id}/` |
| Colors | DELETE | `/colors/{id}/` |
| Pickup locations | GET | `/pickup-locations/` |
| Pickup locations | POST | `/pickup-locations/` |
| Pickup locations | PATCH | `/pickup-locations/{id}/` |
| Pickup locations | DELETE | `/pickup-locations/{id}/` |
| Products | GET | `/products/` (paginated; supports `search`, `is_active` and `category`) |
| Products | POST | `/products/` |
| Products | GET | `/products/{id}/` |
| Products | PATCH | `/products/{id}/` |
| Products | DELETE | `/products/{id}/` (deactivates the product) |
| Product colors | PUT | `/products/{product_id}/colors/` |
| Product images | POST | `/products/{product_id}/images/` |
| Product images | PATCH | `/products/{product_id}/images/{image_id}/` |
| Product images | DELETE | `/products/{product_id}/images/{image_id}/` |

## Roadmap

Planned, not built yet:

- Public storefront: home, product listing, product details, cart, checkout, payment and order lookup.
- Storefront code under `src/customer/`.
- Admin orders management.
- Payment verification.
- Public registration. Registration is currently disabled; the Register route is commented out in `src/routes/LoginRoutes.jsx` and can be re-enabled later.

## Troubleshooting

- `npm install` fails with `ERESOLVE`: use `npm install --legacy-peer-deps`. The repository `.npmrc` already sets this, so also check that the file exists.
- Login returns 401 or 400: confirm the Django backend is running on `http://127.0.0.1:8000` and that the username and password belong to a superuser created with `createsuperuser`.
- API requests fail or CORS errors appear: check the Vite proxy targets in `vite.config.mjs` and the backend URL. For deployed environments, configure the backend CORS and allowed hosts.
- Images do not load: check the `/media` proxy target and confirm the backend serves media files while running with `DEBUG=True`.

## Credits and license

Built on the Mantis Free React Admin Template by CodedThemes (MIT License): https://github.com/codedthemes/mantis-free-react-admin-template

This project is licensed under the MIT License, see LICENSE.
