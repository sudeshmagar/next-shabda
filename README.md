# Shabda - Nepali Dictionary

This is a [Next.js](https://nextjs.org) project for a Nepali-English dictionary application.

## Getting Started

### Prerequisites

1. **Node.js** (version 18 or higher)
2. **MongoDB** running locally on port 27017
3. **npm** or **yarn** package manager

### Local Development Setup

1. **Clone the repository** (if not already done)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your local MongoDB:**
   - Make sure MongoDB is installed and running on your machine
   - Default connection: `mongodb://localhost:27017/shabda-dictionary`
   - The database will be created automatically when you first run the app

4. **Configure environment variables:**
   - Copy `.env.local` and update the values as needed
   - The `MONGODB_URI` should point to your local MongoDB instance
   - Generate a secure `NEXTAUTH_SECRET` for production

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app should connect to your local MongoDB automatically

### Database Structure

The application uses three main collections:
- `words` - Dictionary entries with Nepali and English definitions
- `users` - User accounts and authentication
- `bookmarks` - User bookmarks for words

### Features

- **Dictionary Search** - Search Nepali and English words
- **User Authentication** - Sign up/sign in with email or Google
- **Bookmarks** - Save favorite words (works with or without account)
- **Word Management** - Add and edit dictionary entries
- **Admin Panel** - Manage words and users (admin role required)

### API Endpoints

- `GET/POST /api/words` - Search and create words
- `GET/PUT/DELETE /api/words/[id]` - Get, update, delete specific words
- `GET /api/words/random` - Get random word of the day
- `POST /api/auth/register` - User registration
- `GET/POST /api/bookmarks` - Manage user bookmarks

### Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check if port 27017 is available
- Verify the `MONGODB_URI` in `.env.local`

**Authentication Issues:**
- Make sure `NEXTAUTH_SECRET` is set in `.env.local`
- For Google OAuth, configure your Google Cloud Console properly

**Build Issues:**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.