# FamCare - Family Health Connect

## Family Health Management Platform

Comprehensive app for tracking BMI, meals, exercises, daily routines, child/parent dashboards, and more.

Built with:
- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS
- Supabase backend
- React Router + TanStack Query

## Local Development

```bash
cd family-health-connect-04
npm install
npm run dev  # http://localhost:8080
```

Scripts:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run test` - Vitest

## Deployment

Deploy to:
- [Vercel](https://vercel.com) - `npm run build`, connect repo
- [Netlify](https://netlify.com) - Drag dist/ or repo
- [Railway](https://railway.app) - With Supabase integration

Update Supabase config in `src/integrations/supabase/client.ts`.

## Project Structure
```
src/
├── pages/     # Routes: Login, Dashboards, BMI, etc.
├── components/ui/ # shadcn components
├── contexts/  # AuthContext
└── integrations/supabase/
```

Enjoy FamCare!
