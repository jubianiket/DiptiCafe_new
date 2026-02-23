-- Users table
create table users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    role text check (role in ('admin', 'staff')) not null,
    created_at timestamp default now()
);

-- Orders table
create table orders (
    id uuid primary key default gen_random_uuid(),
    table_no text,
    customer_name text,
    status text check (status in ('pending', 'delivered', 'paid')) default 'pending',
    total_amount numeric(10,2) default 0,
    created_by uuid references users(id),
    created_at timestamp default now()
);

-- Menu items
create table menu_items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    price numeric(10,2) not null,
    created_at timestamp default now()
);

-- Order items
create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    item_name text not null,
    quantity int not null,
    price numeric(10,2) not null,
    created_at timestamp default now()
);

-- Indexes
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);
