# 🗄️ Database Files

This folder contains all database-related files including migrations, schema checks, and SQL scripts.

## 📁 **Folder Structure**

```
database/
├── migrations/          → SQL migration files
├── schemas/            → Schema validation scripts
└── README.md          → This file
```

## 📋 **Migration Files**

All `.sql` files are database migrations and schema updates:
- `supabase-migration.sql` - Main Supabase setup
- `supabase-clerk-schema.sql` - Clerk authentication schema
- `migration.sql` - Core table migrations
- `add-*.sql` - Feature additions
- `update-*.sql` - Schema updates
- `fix-*.sql` - Bug fixes and patches
- `check-*.sql` - Validation queries

## 🔧 **Schema Scripts**

- `check-goals-schema.js` - Validates goals table structure

## 📝 **Usage**

These files are historical records of database changes. For current database schema, refer to:
- `/docs/reference/database-schema.md` - Current schema documentation
- `/docs/setup/database-setup.md` - Setup instructions
