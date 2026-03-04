# Project: QR Menu SaaS

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase JS client
- Formik for forms
- React Query (@tanstack/react-query) for server state
- @floating-ui/react for dropdowns/popovers
- @dnd-kit for drag and drop
- shadcn-ui for ui components
- zod, hookform/resolvers for schema
- sonner for toast
- lucide react for icons
- react-qr-code for generate qr

## Project Structure

src/
├── hooks/
│ └── api/ ← ALL data fetching hooks go here
| all app hooks
├── components/
│ ├── ui/ ← reusable base components
│ └── common components
├── pages/
├── lib/
│ └── configuration
|── @types/ ← shared TypeScript types
| modules/ specific components/function/schema for pages

## Coding Conventions

### Data Fetching

- ALWAYS wrap Supabase queries in a custom hook and tanstact query
- ALWAYS place related api/supabase hooks inside src/hooks/api/
- ALWAYS grouping related fetching data inside one file. example: useGetMenuItem, useDeleteMenuItem in file like use-menu-items.ts
- Example:
  src/hooks/api/useGetMenuItems.ts
  src/hooks/api/useCreateMenuItem.ts

### Components

- ALWAYS use functional components with TypeScript (FC<Props>)
- ALWAYS define Props type above the component
- ALWAYS use Formik for any form with more than 2 fields
- ALWAYS consider if the component you going to create is can be modular or not, if yes place it to src/components

### Styling

- ALWAYS use Tailwind utility classes
- ALWAYS use shadcn style if fit
- NEVER use inline styles unless absolutely necessary

### Supabase

- Import client from src/lib/supabase.ts
- ALWAYS handle loading and error states
- ALWAYS use optimistic updates for toggle/status changes

### TypeScript

- ALWAYS define types for Supabase table rows in src/types/
- No `any` types
- Use optional chaining and nullish coalescing

## What NOT to do

- Never put fetch logic directly inside a component
- Never use axios (we use Supabase client)
- Never use class components
- Never use localStorage for server data
