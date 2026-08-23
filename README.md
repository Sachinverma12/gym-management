# Gym QR Attendance & Membership System

A complete gym management system with Next.js 16 (App Router), Express API, Prisma ORM, and WhatsApp integration.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Test Suite](#test-suite)
- [Project Structure](#project-structure)
- [Build and Deploy](#build-and-deploy)

## Overview

This is a full-stack gym management system featuring:

- **User Authentication**: Signup/login with phone number and password, JWT-based authentication
- **Member Management**: CRUD operations for members with search and filtering
- **Attendance Tracking**: QR code check-in/check-out with monthly attendance counts
- **Membership Plans**: Create and manage monthly/quarterly/yearly plans
- **Payment Recording**: Record payments and track fee status
- **WhatsApp Notifications**: Optional attendance confirmations and reminders
- **Referral System**: Track referrals and rewards

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB (local or cloud)
- Optional: Twilio account for WhatsApp messages

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd gym-app

# Install dependencies
npm install

# Install Prisma CLI
npm install -g prisma

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

Create a `.env` file in the root directory:

```
# Database
MONGODB_URI=mongodb://localhost:27017/gym-db

# JWT
JWT_SECRET=gym-secret-key

# Server
PORT=5000

# Twilio (optional for WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
```

## Running the Application

### Development Mode

```bash
# Start the Next.js frontend (port 3000)
npm run dev

# Start the Express backend (port 5000) - in a separate terminal
npm run server
# or: node server/index.js
```

The app will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:5000/api/

### Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build Next.js for production |
| `npm run start` | Start Next.js production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest tests |
| `npm run server` | Start the Express API server |

## API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register a new user |
| `/api/auth/login` | POST | Login with phone and password |

**Signup Request:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "role": "MEMBER"
  }
}
```

### Members

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/members` | GET | Yes | Get all members |
| `/api/members/:id` | GET | Yes | Get member by ID |
| `/api/members` | POST | Yes | Add new member |
| `/api/members/:id` | PUT | Yes | Update member |
| `/api/members/:id` | DELETE | Yes | Delete member |

**Search & Filter:**
```
GET /api/members?status=PENDING&plan=MONTHLY
```

### Attendance

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/attendance/check-in` | POST | Yes | Check in |
| `/api/attendance/check-out` | POST | Yes | Check out |
| `/api/attendance/history/:userId` | GET | Yes | Get attendance history |
| `/api/attendance/monthly-count/:userId` | GET | Yes | Get monthly count |

**Check-in Request:**
```json
{
  "userId": "user-id",
  "branchId": "default-branch",
  "userAgent": "Mozilla/5.0",
  "ip": "192.168.1.1"
}
```

### Plans

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/plans` | GET | Yes | Get active plans |
| `/api/plans/:id` | GET | Yes | Get plan by ID |
| `/api/plans` | POST | Yes | Create new plan |
| `/api/plans/:id` | PUT | Yes | Update plan |
| `/api/plans/:id` | DELETE | Yes | Delete plan |

**Create Plan Request:**
```json
{
  "name": "Monthly Plan",
  "description": "Monthly membership",
  "price": 50,
  "duration": "1 month",
  "durationNum": 1,
  "durationUnit": "month"
}
```

### Payments

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/payments` | POST | Yes | Record payment |
| `/api/payments/history/:userId` | GET | Yes | Get payment history |
| `/api/payments` | GET | Yes | Get all payments |
| `/api/payments/manual-mark/:id` | POST | Yes | Mark payment as received |

**Record Payment Request:**
```json
{
  "userId": "user-id",
  "amount": 50,
  "method": "cash",
  "transactionId": "txn-12345"
}
```

## Test Suite

The project includes comprehensive Jest tests covering:

- **JWT token generation and verification** (3 tests)
- **Membership plan configuration** (6 tests)
- **Payment recording logic** (6 tests)
- **Attendance logic** (4 tests)
- **User role validation** (2 tests)

Run tests:
```bash
npm test
```

All 14 tests pass successfully.

## Project Structure

```
gym-app/
├── app/                  # Next.js 16 App Router
│   ├── layout.tsx        # Root layout with Tailwind/Geist fonts
│   ├── page.tsx          # Home page
│   ├── auth/page.tsx     # Authentication page
│   ├── members/page.tsx  # Members management page
│   ├── attendance/page.tsx # Attendance tracking page
│   └── admin/page.tsx    # Admin dashboard page
├── server/               # Express API server
│   ├── index.js          # Server entry point
│   ├── routes/           # API route handlers
│   │   ├── auth.js       # Authentication routes
│   │   ├── members.js    # Member management routes
│   │   ├── attendance.js # Attendance routes
│   │   ├── plans.js      # Membership plan routes
│   │   └── payments.js   # Payment routes
│   ├── models/           # Mongoose models
│   │   ├── user.model.js
│   │   ├── attendance.model.js
│   │   ├── payment.model.js
│   │   ├── membershipPlanConfig.model.js
│   │   └── referral.model.js
│   └── jest.setup.ts     # Jest test setup
├── prisma/               # Prisma ORM schema
│   └── schema.prisma
├── components/           # Reusable React components (empty - to be added)
├── lib/                  # Utility libraries (to be added)
└── package.json          # Project configuration
```

## Build and Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Deploy to Vercel

The easiest deployment option is Vercel:

```bash
vercel
# or connect your GitHub repository to Vercel
```

## Features to Add

- [ ] WhatsApp message sending integration
- [ ] Email notifications
- [ ] QR code generation for check-in
- [ ] Role-based access control
- [ ] Dark mode enhancements
- [ ] Additional report views
- [ ] Component library