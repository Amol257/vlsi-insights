# VLSI Insights — Backend Service

A modular, production-ready Node.js/Express API service handling Razorpay payment processing, order tracking, Supabase database synchronization, contact inquiries, and student enrollments.

---

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Key | Description |
| --- | --- |
| `PORT` | API server port (default `5000`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (for bypassing RLS securely on backend) |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_test_...` or `rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key |
| `FRONTEND_URL` | Comma-separated list of allowed CORS origins |

### 3. Start the Server

```bash
# Production start
npm start

# Development mode with hot-reload (Node.js 18+)
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## API Endpoints

### Health Check
* `GET /api/health` — Check server status, environment, and uptime timestamp.

### Payments
* `POST /api/payments/create-order`
  * **Body**: `{ items: [...], promoCode: "VLSI10", user: { id, email } }`
  * **Response**: Authoritative Razorpay order ID, amount in paise, currency, and receipt ID.
* `POST /api/payments/verify`
  * **Body**: `{ orderId, paymentId, signature }`
  * **Response**: Cryptographic signature verification result and enrollment confirmation.
* `POST /api/payments/webhook`
  * Razorpay webhook listener for asynchronous event capture.

### Contact Inquiries
* `POST /api/contact`
  * **Body**: `{ name, email, phone, message, source }`
  * **Response**: Confirmation message and record ID in Supabase.

### Enrollments & Syllabus Requests
* `POST /api/enrollment`
  * **Body**: `{ name, email, phone, program, degree, gradYear, source }`
  * **Response**: Application record stored in Supabase.

---

## Database Migrations

Run `database/schema.sql` in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) to provision the `orders` and `user_enrollments` tables.
