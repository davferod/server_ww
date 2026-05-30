# 🌱 NestJS Seeder Module - Implementation Summary

## Overview
Refactored gym-tracker-ww user seeding infrastructure from standalone HTTP-dependent scripts to a centralized NestJS SeederModule that runs independently without requiring a running server.

---

## Architecture

### Core Components

#### 1. **SeederModule** (`src/seeder/seeder.module.ts`)
- Initializes NestJS ApplicationContext (not HTTP server)
- Imports:
  - `ConfigModule.forRoot()` - Reads `.env` for MongoDB URI
  - `DatabaseModule` - Mongoose connection to Atlas
  - `UsersModule` - Access to UsersService
- Exports: `SeederService`

#### 2. **SeederService** (`src/seeder/seeder.service.ts`)
- Manages all seeding operations
- Uses `UsersService.create()` directly (includes automatic bcrypt hashing + ProfilesService integration)
- Three primary methods:
  - `seedUsers()` - Creates all users (regular + admin)
  - `seedRegularUsers()` - Creates only user-role accounts
  - `seedAdmins()` - Creates only admin/superadmin accounts
- Data source: `scripts/users-seed.example.json`
- Error handling: Gracefully handles duplicate users, logs detailed reports

#### 3. **Entry Point** (`src/seeder.ts`)
- CLI application using NestFactory.createApplicationContext()
- Command-line arguments:
  - `--all` : Seed all users
  - `--users` : Seed only regular users
  - `--admin` : Seed only administrators
- Includes startup/shutdown logging

---

## Key Improvements

### ✅ Before (Broken Architecture)
- Multiple standalone scripts with different MongoDB URIs
- Some scripts pointed to `localhost:27017` instead of Atlas
- HTTP-dependent (required running server)
- Duplicated logic across scripts
- No use of framework services

**Broken Scripts Removed:**
- `seed-user.mjs` - Read JSON but didn't use UsersService.create()
- `fix-user-roles.mjs` - Wrong MongoDB URI (localhost)
- `fix-roles-simple.mjs` - Wrong MongoDB URI (localhost)
- `bootstrap-admin.mjs` - HTTP wrapper to mutation
- `update-roles.mjs` - HTTP wrapper to mutation

### ✅ After (NestJS Integration)
- Single, unified seeding through NestJS context
- Uses ConfigModule for correct MongoDB Atlas URI from `.env`
- Direct access to UsersService (bcrypt + ProfilesService automatic)
- Independent execution without server
- Detailed logging and error reporting
- Validates users before creation

**Working Seeder Implementation:**
- ✅ Reads from `scripts/users-seed.example.json`
- ✅ Connects to MongoDB Atlas via ConfigModule
- ✅ Uses UsersService.create() (auto bcrypt + profile)
- ✅ Uses UsersService.updateRole() for admin roles
- ✅ Handles duplicates gracefully
- ✅ Provides execution reports

---

## Usage

### Installation
No additional dependencies required (uses existing NestJS stack)

### Commands

```bash
# Seed all users (regular + admin/superadmin)
npm run seed:all

# Seed only regular users (role: 'user')
npm run seed:users

# Seed only administrators (role: 'admin' or 'superadmin')
npm run seed:admin
```

### Example Output
```
════════════════════════════════════════════════════════════
🌱 Gym Tracker WW - Database Seeder
════════════════════════════════════════════════════════════

[Nest] 2848 - 29/05/2026, 10:49:32 p.m. LOG [SeederService] 🌱 Iniciando seeding de usuarios...
[Nest] 2848 - 29/05/2026, 10:49:32 p.m. LOG [SeederService] ✅ Cargados 6 usuarios de ...users-seed.example.json
[Nest] 2848 - 29/05/2026, 10:49:33 p.m. WARN [SeederService] ⊘ Usuario ya existe: davvidrd81@gmail.com
[Nest] 2848 - 29/05/2026, 10:49:33 p.m. LOG [SeederService] 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Nest] 2848 - 29/05/2026, 10:49:33 p.m. LOG [SeederService] 📊 Resumen de seeding:
[Nest] 2848 - 29/05/2026, 10:49:33 p.m. LOG [SeederService]    ✅ Creados: 0
[Nest] 2848 - 29/05/2026, 10:49:33 p.m. LOG [SeederService]    ⊘ Saltados: 6
[Nest] 2848 - 29/05/2026, 10:49:33 p.m. LOG [SeederService]    ✗ Fallidos: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Seed Data Format

### `scripts/users-seed.example.json`
```json
[
  {
    "email": "davvidrd81@gmail.com",
    "username": "davferod",
    "password": "SuperPass123!",
    "role": "superadmin"
  },
  {
    "email": "entrenador1@gym.com",
    "username": "entrenador1",
    "password": "Entrenador123!",
    "role": "admin"
  },
  {
    "email": "atleta1@gym.com",
    "username": "atleta1",
    "password": "Atleta123!",
    "role": "user"
  }
]
```

**Fields:**
- `email` - Unique user email
- `username` - Unique username
- `password` - Plain text (auto-bcrypt during create)
- `role` - One of: 'user', 'admin', 'superadmin', 'guest'

---

## Updated npm Scripts

### Removed (Old Architecture)
```json
"seed:user": "node scripts/seed-user.mjs",
"seed:users": "node scripts/seed-user.mjs --file scripts/users-seed.example.json",
"bootstrap:admin": "node scripts/bootstrap-admin.mjs",
"fix:roles": "node scripts/fix-user-roles.mjs",
"fix:roles:file": "node scripts/fix-user-roles.mjs --file scripts/role-updates.example.json",
"update:roles": "node scripts/update-roles.mjs"
```

### Added (New NestJS Architecture)
```json
"seed:all": "ts-node -r tsconfig-paths/register src/seeder.ts --all",
"seed:users": "ts-node -r tsconfig-paths/register src/seeder.ts --users",
"seed:admin": "ts-node -r tsconfig-paths/register src/seeder.ts --admin"
```

### Kept (Validation/Testing)
```json
"test:users": "node scripts/test-users.mjs",
"test:users:list": "node scripts/test-users.mjs --list-users"
```

---

## Data Files

### Maintained
- `scripts/users-seed.example.json` - ✅ Updated with davferod
- `scripts/test-logins.example.json` - ✅ Includes davferod credentials

### Removed (Cleanup)
- `scripts/seed-user.mjs` - Replaced by SeederModule
- `scripts/fix-user-roles.mjs` - Broken (wrong DB URI)
- `scripts/fix-roles-simple.mjs` - Broken (wrong DB URI)
- `scripts/bootstrap-admin.mjs` - Replaced by SeederModule
- `scripts/update-roles.mjs` - Replaced by SeederModule
- `scripts/role-updates.example.json` - No longer needed
- `scripts/EXAMPLES.md`, `README.md`, `TEST-USERS.md` - Documentation moved

---

## Technical Details

### Database Connection Flow
```
SeederModule
  → ConfigModule.forRoot()
    → Reads .env
      → MONGODB_URI = "mongodb+srv://..." (Atlas)
  → DatabaseModule
    → MongooseModule connects via URI
  → UsersModule
    → UsersService.create() available
```

### User Creation Flow
```
SeederService.seedUsers()
  → Read users-seed.example.json
  → For each user:
    → Check if exists (findOne)
    → If not:
      → Call UsersService.create(LoginUserInput)
        → Auto bcrypt password
        → Auto invoke ProfilesService.create()
      → If role !== 'user':
        → Call UsersService.updateRole(email, role)
      → Log success
    → If exists:
      → Log warning (skip)
```

### Error Handling
- **Duplicate users**: Logged as warnings, skipped
- **Invalid roles**: Validated by `UsersService.updateRole()`
- **DB connection fails**: Process exits with code 1
- **File not found**: Throws error during initialization

---

## Verification Checklist

✅ **Phase 1 - Implementation:**
- SeederModule created with proper imports
- SeederService implements three seeding methods
- Entry point (seeder.ts) with CLI argument parsing
- Backend compilation successful
- All three seed commands execute without server

✅ **Phase 2 - Data & Cleanup:**
- davferod added to users-seed.example.json
- davferod added to test-logins.example.json
- 5 obsolete scripts removed
- 4 obsolete documentation files removed

✅ **Phase 3 - npm Scripts:**
- 6 old seed commands removed
- 3 new seed commands added
- 2 test commands maintained
- test:users still functional (HTTP-based, requires server)

---

## Future Enhancements

Potential improvements:
- CLI interactive mode (prompt for users instead of file)
- Bulk update operations
- Export user data to JSON
- Role migration utilities
- Password reset functionality

---

## Support

**Running seeder independently (no server required):**
```bash
npm run seed:all
```

**For testing with running server:**
```bash
npm start:dev &    # Terminal 1 - Start backend
npm run test:users # Terminal 2 - Run tests
```

**Troubleshooting:**
- `.env` must contain valid MONGODB_URI
- Database must be `workoutwise` (auto-created)
- Check `scripts/users-seed.example.json` format
- Review logs for duplicate email/username errors

