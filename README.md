# Linked

Save links on your phone and open them later on your laptop. You can also paste
URLs or send text directly in the inbox.

[Open Linked](https://linkd-pearl.vercel.app)

## Android sharing

1. Open Linked in Chrome on Android.
2. Open Chrome's **Add to Home screen** menu.
3. Choose **Install**. A home-screen shortcut won't appear in the Share menu.
4. From a webpage, tap **Share → Linked**. Use **More** if it isn't in the first list.
5. Open Linked in Brave on your laptop to find the saved link.

Saving needs an internet connection. Failed saves have a Retry button, and
repeated URLs reuse the existing link.

This version has one shared inbox with no login. Anyone who can access the site
can read and add messages.

## Run locally

Built with Next.js, React, TypeScript, and MongoDB. Use Node.js 20.9+ and a
MongoDB connection whose user can create indexes.

```sh
npm install
```

Create `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
```

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). Deploy over HTTPS for Android installation.

## Checks and production build

```sh
npm test
npm run lint
npm run build
npm start
```

Tests cover URL handling, duplicate saves, and the share receiver using mocks.
Check Android's Share menu on a real phone after changing the manifest.
