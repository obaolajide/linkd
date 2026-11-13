# linkd

A modern messaging application built with Next.js, React, and MongoDB. Share and manage text and link messages with a clean, intuitive interface.

## Features

- Send text messages and links
- Real-time message refresh
- Messages stored in MongoDB
- Full-stack TypeScript support
- Clean and responsive UI
- Android Chrome share destination (install Linked first)

## Share webpages from Android

This checkout uses one shared inbox. It has no login, user accounts, or per-user
ownership. Shared and manually submitted links use the existing MongoDB collection
through the same `/api/messages` endpoint. Use the same deployment on both devices.

1. Deploy this version over HTTPS with the existing `MONGODB_URI` configured.
   The current production address is [linkd-pearl.vercel.app](https://linkd-pearl.vercel.app).
   Generated Vercel preview addresses may require a Vercel login and should not be
   used for Android installation.
2. Open the deployment in **Chrome on Android** and install **Linked** using Chrome's
   menu (Install app / Add to Home screen, then Install). A simple browser shortcut
   is not enough. If an older installation does not show in Share, reinstall it
   after deploying the updated manifest.
   The inbox's **Set up Android sharing** panel offers **Install Linked** when
   Chrome makes its installation prompt available, plus manual installation steps
   and installation-file readiness feedback. Readiness does not prove that Android
   has registered the installed app in its Share menu.
3. From any webpage in Chrome, tap **Share → Linked**. Linked opens a receiving
   page and automatically saves the URL. It reports success or offers Retry if
   saving fails; no manual paste or submit is needed.
4. Open the same deployment in Brave on your laptop. The link appears in the
   existing inbox and opens in a new tab. An already-open inbox reloads when you
   focus it; the Refresh button also remains available.

Android installs the share destination from `public/manifest.webmanifest`.
The GET `/share` page accepts `url`, `text`, and `title`, extracts the first valid
HTTP(S) URL, and POSTs to the existing API. GET alone does not write to MongoDB.
The optional title is displayed as the link label; shared text is retained as
metadata. Query parameters are cleared from the current history entry after save.
Shared URLs can still occur in server access logs because this is a GET target.
The receiver handles successive shares into the same open window. A successful
save replaces the current history entry with `/share?saved=1`, so reloading the
confirmation does not submit it again.

Repeated normalized URLs reuse an existing link, including links saved manually.
Fragments and query parameters are preserved; unrelated text messages are never
deduplicated. A unique sparse `linkKey` index prevents simultaneous new-link
submissions from creating duplicates. Existing rows do not need a data migration;
the MongoDB user must have permission to create the new index.

Network access is required to save. The service worker provides an offline retry
message and does not cache the inbox or queue background submissions. On an offline
share, reconnect and reload the receiving page. On a server error, use Retry.

### Verification

Run `npm test`, `npm run lint`, and `npm run build`. Automated tests cover share
payload extraction, validation, manifest/icons, and duplicate storage behavior
using a mocked database, plus receiving a second share in the same window and
handling server errors. They do not prove Android share-sheet registration or
live MongoDB persistence.

After deployment, complete this real-device check:

- Install from Android Chrome and confirm Linked appears in Chrome's Share menu.
- Share an article, an X post, and a GitHub URL; confirm the success message.
- Share the same URL twice; verify only one inbox item appears.
- Open the deployment in Brave and click the saved URLs.
- Test `/share`, `/share?text=not-a-url`, and a disconnected share; confirm useful
  errors and successful retry after reconnecting.
- Confirm manual text and URL submissions still work.

For a desktop receiver smoke check, visit
`/share?title=Example&text=https%3A%2F%2Fexample.com%2F` on your deployment.
This intentionally saves an example link into the shared inbox.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Development**: ESLint, Babel React Compiler

## Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB instance (local or cloud)

## Installation

1. Clone the repository:
```bash
git clone <https://github.com/ArcTyXiaN/linkd.git>
cd linkd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_connection_string
```

## Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Build

Create an optimized production build:
```bash
npm run build
npm start
```

## Project Structure

```
linkd/
├── app/
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout component
│   └── api/
│       └── messages/
│           └── route.ts   # Messages API endpoint
├── components/
│   ├── MessageList.tsx    # Display messages
│   └── MessageInput.tsx   # Input form for new messages
├── lib/
│   └── db.ts              # Database connection setup
├── models/
│   └── Message.ts         # Mongoose Message schema
└── public/                # Static assets
```

## API Endpoints

### GET `/api/messages`
Fetch all messages from the database.

**Response:**
```json
[
  {
    "_id": "...",
    "text": "message content",
    "type": "text",
    "createdAt": "2026-04-14T..."
  }
]
```

### POST `/api/messages`
Create a new message.

**Request Body:**
```json
{
  "text": "message content",
  "type": "text" | "link"
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
"# linkd" 
