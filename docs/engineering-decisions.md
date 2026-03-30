# Engineering Decisions

This document explains key technical decisions made while building the Golf Charity Subscription Platform.

---

## 1. Why Next.js (App Router)?

Next.js was chosen to enable:

* Full-stack development in a single codebase
* Server-side rendering and API routes
* Simplified deployment with Vercel

The App Router structure helps organize pages, layouts, and backend logic clearly.

---

## 2. Why Supabase?

Supabase was used for:

* Authentication (built-in auth system)
* PostgreSQL database
* Row Level Security (RLS)

This allowed rapid development without managing a custom backend server.

---

## 3. Why Razorpay for Payments?

Razorpay was selected because:

* It provides easy integration for Indian payments
* Supports subscriptions and recurring payments
* Has a simple frontend + backend integration flow

---

## 4. Score Retention Logic

Only the latest 5 scores are stored per user.

### Reason:

* Keeps the system simple and lightweight
* Matches real-world scenarios where recent performance matters more
* Avoids unnecessary database growth

---

## 5. Role-Based Access Control

Two roles are used:

* `user`
* `admin`

### Design Decision:

* Users can only access their own data
* Admin has global access for managing the system

This is enforced using **Supabase RLS policies**.

---

## 6. Subscription Access Control

Users without an active subscription are restricted from:

* Accessing dashboard features
* Adding scores
* Participating in draws

### Reason:

This ensures the business logic is properly enforced at the application level.

---

## 7. Why No Separate Backend Server?

Instead of using Express/Spring Boot:

* Backend logic is handled using Next.js API routes
* Supabase handles authentication and database

### Benefit:

* Reduced complexity
* Faster development
* Easier deployment

---

## 8. Limitations and Tradeoffs

* Limited analytics features (can be expanded)
* No automated testing currently
* Payment flow is in test mode
* Scalability considerations not fully implemented

---

## 9. Future Engineering Improvements

* Add background jobs for draw processing
* Implement caching for performance
* Add audit logs for admin actions
* Improve subscription renewal handling
* Introduce automated testing (unit + integration)

---

## Summary

The system is designed as a practical full-stack application balancing:

* simplicity
* real-world features
* maintainability

while demonstrating core engineering concepts.
