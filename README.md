This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Architecture: Feature-Sliced Design (FSD)

This project strictly follows the [Feature-Sliced Design](https://feature-sliced.design/) architectural pattern.

1.  **`app/`**: Routing, global styles, and providers.
2.  **`widgets/`**: Complex UI blocks (e.g., `Sidebar`, `MapView`).
3.  **`features/`**: User interactions (e.g., `search-city`, `locate-user`).
4.  **`entities/`**: Business data & domain logic (e.g., `pharmacy`, `city`).
5.  **`shared/`**: Reusable infrastructure (e.g., `api`, `ui`, `lib`).

All slices expose their public interface via an `index.ts` barrel file. Direct imports from slice internals are forbidden.
