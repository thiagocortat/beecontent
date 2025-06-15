# BeeContent - Content Management System

A modern content management system built with Next.js, Prisma, and NextAuth for creating and managing blog posts with AI-powered content generation.

## Features

- 🔐 **Authentication**: Secure login system with NextAuth
- 📝 **Content Management**: Create, edit, and manage blog posts
- 🤖 **AI Content Generation**: Generate blog content using Groq
- 👥 **Role-based Access**: Admin and Editor roles
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI
- 🗄️ **Database**: SQLite with Prisma ORM

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Groq API
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bee_content
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   GROQ_API_KEY="your-groq-api-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Create an admin user**
   ```bash
   npm run create-admin admin@hotel.com suasenha123
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) and login with your admin credentials

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # UI components
│   └── sidebar.tsx        # Navigation
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run create-admin` - Create admin user

## API Endpoints

### Public API
- `GET /api/posts` - List published posts
- `GET /api/posts/[slug]` - Get post by slug

### Protected API
- `POST /api/generate` - Generate AI content (requires authentication)

## Database Schema

### User Model
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `role` - User role (ADMIN/EDITOR)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Post Model
- `id` - Unique identifier
- `title` - Post title
- `slug` - URL slug (unique)
- `content` - Post content
- `excerpt` - Short description
- `metaDescription` - SEO meta description
- `keywords` - SEO keywords
- `featuredImage` - Featured image URL
- `status` - Post status (DRAFT/PUBLISHED)
- `publishedAt` - Publication timestamp
- `authorId` - Author reference
- `tags` - JSON string of tags
- `hotelId` - Multi-tenant support

## Authentication

The application uses NextAuth.js for authentication with credentials provider. Users can sign in with email and password.

### User Roles
- **ADMIN**: Full access to all features
- **EDITOR**: Can create and edit content
- **VIEWER**: Read-only access

### Creating Users

#### Create Admin User
To create an administrator user, use the provided script:

```bash
npm run create-admin <email> <password>
```

Example:
```bash
npm run create-admin admin@hotel.com minhasenha123
```

#### Manual User Creation
You can also create users manually using Prisma Studio:

1. Open Prisma Studio:
   ```bash
   npm run db:studio
   ```

2. Navigate to the `User` table
3. Click "Add record"
4. Fill in the required fields:
   - `email`: User's email address
   - `password`: Use a bcrypt hash of the password
   - `role`: Set to "ADMIN", "EDITOR", or "VIEWER"

#### Login
After creating a user, you can login at `/login` with the email and password.

## AI Content Generation

The system integrates with Groq to generate blog content using Llama 3 model. To use this feature:

1. Set up your Groq API key in the `.env` file
2. Navigate to "New Article" in the dashboard
3. Use the AI generation form to create content based on:
   - Destination
   - Season
   - Target audience
   - Keywords

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GROQ_API_KEY="your-groq-api-key"
```

### Build and Deploy

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.