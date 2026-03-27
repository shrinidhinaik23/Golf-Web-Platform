# ⛳ Golf Charity Subscription Platform

A full-stack subscription-based web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward system.

This project is designed as a modern, engaging platform that avoids traditional golf UI patterns while delivering real-world system functionality including payments, lifecycle management, and admin controls.

---

## 🚀 Live Demo

- 🌐 Live Website: https://golf-web-platform.vercel.app  
- 👤 User Dashboard: https://golf-web-platform.vercel.app/dashboard  
- 🛠 Admin Panel: https://golf-web-platform.vercel.app/admin  

---

## 📌 Core Features

### 🔐 Authentication & Roles
- Secure user signup and login (Supabase Auth)
- Role-based access control (User / Admin)

---

### 💳 Subscription & Payment System
- Monthly and Yearly subscription plans
- Razorpay payment integration
- Subscription lifecycle:
  - Active
  - Cancelled
  - Lapsed
- Payment retry and reactivation
- Restricted access for non-subscribers

---

### 📊 Score Management System
- Stableford score entry
- Score range: 1–45
- Each score includes date
- Only latest 5 scores retained
- Oldest score automatically replaced
- Latest scores shown first

---

### 🎯 Draw & Reward System
- Monthly draw system
- Match types:
  - 5-number match
  - 4-number match
  - 3-number match
- Random draw generation
- Admin-controlled publishing

---

### ❤️ Charity Integration
- Charity selection by user
- Adjustable contribution %
- Automatic donation calculation
- Donation tracking

---

### 👤 User Dashboard
- Subscription management
- Score entry & history
- Charity selection
- Account overview

---

### 🛠 Admin Panel
- Manage users
- Run draws
- Manage winners
- Verify payouts
- Upload proof
- View analytics

---

## 🧱 Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (DB + Auth)
- Razorpay (Payments)
- Vercel (Deployment)

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/shrinidhinaik23/Golf-Web-Platform.git
cd Golf-Web-Platform
```

---

### 2. Install Dependencies

```bash
npm install
npm install @supabase/supabase-js razorpay clsx react-icons
```

---

### 3. Add Environment Variables

Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

### 4. Run Project

```bash
npm run dev
```

Open:
```
http://localhost:3000
```

---

## 🧪 Testing Checklist

- Signup & login  
- Payment flow  
- Score entry (5-score logic)  
- Draw system  
- Charity contribution  
- Admin panel  
- Edge cases  

---

## 👨‍💻 Author

Shrinidhi Naik  
https://github.com/shrinidhinaik23  

---

## 📄 License

Educational / assignment use