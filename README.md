# Kundli Portal & Admin Dashboard

A full-stack web application designed for managing and delivering astrological Kundli reports. The system features a robust, role-based architecture with separate portals for administrators and users, integrated with a secure credit-based payment system.

## 🌟 Key Features

### User Portal
- **Dashboard Overview**: Track available credits and historical report orders.
- **Credit Purchasing**: Securely purchase credits via Razorpay checkout.
- **Astrological Reports**: Request custom Kundli files using available credits.
- **Order Tracking**: Monitor the status of generated reports.

### Admin Dashboard
- **User Management**: Add, edit, or disable user accounts.
- **Credit Allocation**: Manually assign credits to users for promotional or support purposes.
- **Transaction Logs**: Granular tracking of all credit movements (purchases vs. manual allocations).
- **Order Fulfillment**: Track and manage user Kundli requests.

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **Payment Gateway UI**: Razorpay Checkout SDK

### Backend
- **Server**: Node.js & Express.js
- **Database / BaaS**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Payment Verification**: Razorpay Webhooks (Cryptographic Signature Verification)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project
- A Razorpay Account (Test or Live mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bloomxpradeep/kundli_dashboard.git
   cd kundli_dashboard
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   * Rename `.env.example` to `.env` and fill in your Supabase and Razorpay credentials.
   * Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   * Rename `.env.example` to `.env` and configure your API URL and Razorpay Key ID.
   * Start the frontend server:
   ```bash
   npm run dev
   ```

## 🔒 Security

- **Webhooks**: The backend utilizes Razorpay webhooks with idempotency checks to guarantee that users are accurately credited even if their browser closes prematurely during checkout.
- **Service Roles**: Administrative tasks are securely handled via the backend utilizing the Supabase Service Role key, strictly isolating admin privileges from standard users.

## 📝 License

This project is licensed under the MIT License.
