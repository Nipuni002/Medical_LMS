# Database Seed Scripts

This folder contains seed scripts to populate the database with initial data for development and testing.

## Available Seeds

### 1. seedAdmin.js
Creates an admin user for accessing the admin dashboard.

**Default Credentials:**
- Email: thakshilaperera37@gmail.com
- Password: AdminN123

**Usage:**
```bash
cd server
node seeds/seedAdmin.js
```

### 2. seedTheorySubjects.js
Seeds PLAB theory subjects with weightage information.

**Usage:**
```bash
cd server
node seeds/seedTheorySubjects.js
```

### 3. seedEthicsContent.js
Seeds sample content for the "Ethics, Law & Communication" subject with topics and video links.

**Prerequisites:**
- The "Ethics, Law & Communication" subject must exist
- An admin user must be created

**Usage:**
```bash
cd server
node seeds/seedEthicsContent.js
```

### 4. seedPlabContent.js
Seeds general PLAB content (What is PLAB, Tips, etc.).

**Usage:**
```bash
cd server
node seeds/seedPlabContent.js
```

### 5. seedPlab1Tips.js
Seeds PLAB 1 preparation tips and strategies.

**Usage:**
```bash
cd server
node seeds/seedPlab1Tips.js
```

## Prerequisites

Before running any seed scripts:

1. **MongoDB Connection**: Ensure MongoDB is running and the `.env` file contains a valid `MONGODB_URI`
2. **Environment Variables**: Make sure all required environment variables are set in the `.env` file
3. **Dependencies**: Install all required packages with `npm install`

## Running Seeds

### Run Individual Seeds
```bash
cd server
node seeds/[seedFileName].js
```

### Run All Seeds (Recommended Order)
```bash
cd server
node seeds/seedAdmin.js
node seeds/seedTheorySubjects.js
node seeds/seedEthicsContent.js
node seeds/seedPlabContent.js
node seeds/seedPlab1Tips.js
```

## Notes

- All seed scripts connect to the database, perform the seeding operation, and automatically disconnect
- If data already exists, some scripts may skip or update existing records - check individual script behavior
- Each script provides console output indicating success or failure
