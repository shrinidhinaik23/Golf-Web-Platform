# Row Level Security (RLS) Policies

This project uses **Supabase Row Level Security** to protect user data and admin functionality.

## Policy Design

### profiles

* Users can read their own profile
* Users can update their own profile
* Admin can read all profiles

### subscriptions

* Users can read their own subscriptions
* Users can create their own subscription records after payment
* Admin can read all subscriptions
* Admin can update subscription status

### scores

* Users can read their own scores
* Users can insert their own scores
* Users cannot view other users' scores
* Admin can read all scores for monitoring

### charities

* Anyone can view charities
* Only admin can insert, update, or delete charities

### draws

* Users can view draw results
* Only admin can create and manage draws

### winners

* Users can view winner records
* Only admin can insert or publish winners

### donations

* Users can view their own donation entries
* Admin can read all donation records

---

## Example Policy Logic

### User-owned data access

```sql id="v0x1ud"
auth.uid() = user_id
```

### Admin-only access

```sql id="ym3ewq"
exists (
  select 1
  from profiles
  where profiles.id = auth.uid()
    and profiles.role = 'admin'
)
```

### Public read access for charities

```sql id="ko2wlz"
true
```

---

## Why RLS Matters

RLS ensures that:

* users only access their own sensitive data
* admin actions are protected
* public-facing data remains viewable where required
* the system is safer for real-world deployment
