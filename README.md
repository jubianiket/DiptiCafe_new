# Dipti's Orders - Cafe Order Management App

This is a full-stack cafe order management web application built with Next.js, Supabase, and Tailwind CSS.

## Features

- **User Roles**: Admin and Staff roles with different permissions.
- **Order Management**: Create, view, update status, and delete orders.
- **Real-time Dashboard**: View all orders and filter them by status (Pending, Delivered, Paid).
- **Daily Sales Summary**: Track total orders and revenue for the day.
- **Responsive UI**: Mobile-friendly design for waiters using tablets or phones.
- **Modern Tech Stack**: Built with Next.js App Router, Server Components, and Server Actions.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com) account

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set up Supabase

1.  **Create a new project** on [Supabase](https://app.supabase.com).
2.  Navigate to the **SQL Editor** in your Supabase project dashboard.
3.  Copy the entire content of the `sql/schema.sql` file from this repository.
4.  Paste the SQL into the editor and click **Run** to create the necessary tables (`orders`).

### 5. Configure Environment Variables

1.  Create a new file named `.env.local` in the root of your project.
2.  Go to your Supabase project's **Settings > API**.
3.  Find your **Project URL** and **anon public key**.
4.  Add them to your `.env.local` file:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
    ```

    **Note**: The app uses Row Level Security (RLS) policies defined in `sql/schema.sql` for data access. For simplicity, we use the `anon` key, which is safe for public exposure.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser to see the application.

You can use the Role Switcher in the header to toggle between "Staff" and "Admin" views to see the different UI and permissions.
