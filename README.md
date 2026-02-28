# Dipti's Orders - Cafe Order Management App

This is a full-stack cafe order management web application built with Next.js, Supabase, and Tailwind CSS.

## Features

- **User Roles**: Admin and Staff roles with different permissions.
- **Order Management**: Create, view, update status, and delete orders.
- **Real-time Dashboard**: View all orders and filter them by status (Pending, Delivered, Paid).
- **Daily Sales Summary**: Track total orders and revenue for the day.
- **Responsive UI**: Mobile-friendly design for waiters using tablets or phones.
- **Voice Orders**: Quick order taking using AI-powered voice recognition.
- **Inventory Sync**: Automatic stock adjustments based on orders.
- **WhatsApp Sharing**: Share bills and payment QR codes directly with customers.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [Genkit](https://js.flare.dev/genkit/) & Gemini

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
3.  Run the following SQL queries to create the necessary tables.

    ```sql
    -- Table to store orders
    CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        table_no TEXT,
        customer_name TEXT,
        phone_number TEXT,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'paid')),
        created_by UUID
    );

    -- Table to store items within an order
    CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
    );

    -- Table to store menu items
    CREATE TABLE menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        price REAL NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Table to store gaming sessions
    CREATE TABLE play_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_type TEXT NOT NULL CHECK (table_type IN ('pool', 'snooker')),
        start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        end_time TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Table to store inventory items
    CREATE TABLE inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit TEXT,
        low_stock_threshold INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Table for global settings (QR codes, etc.)
    CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );

    -- Function to update updated_at timestamp on inventory table
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to automatically update updated_at on inventory row update
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    -- Indexes for faster queries
    CREATE INDEX idx_orders_status ON orders(status);
    CREATE INDEX idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX idx_play_sessions_status ON play_sessions(status);
    ```

### 5. Configure Environment Variables

1.  Create a new file named `.env.local` in the root of your project.
2.  Go to your Supabase project's **Settings > API**.
3.  Find your **Project URL** and **anon public key**.
4.  Add them to your `.env.local` file:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
    ```

### 6. Run the Development Server

```bash
npm run dev
```