# Database Schema

This project uses **Supabase** as the backend for authentication and database storage.

## Main Tables

### 1. profiles

Stores user profile and role information.

| Column     | Type      | Description                   |
| ---------- | --------- | ----------------------------- |
| id         | uuid      | References authenticated user |
| full_name  | text      | User full name                |
| email      | text      | User email                    |
| role       | text      | `user` or `admin`             |
| created_at | timestamp | Profile creation time         |

---

### 2. subscriptions

Tracks subscription plan and lifecycle.

| Column       | Type      | Description                     |
| ------------ | --------- | ------------------------------- |
| id           | uuid      | Primary key                     |
| user_id      | uuid      | References profiles.id          |
| plan         | text      | `monthly` or `yearly`           |
| status       | text      | `active`, `cancelled`, `lapsed` |
| amount       | numeric   | Subscription amount             |
| start_date   | date      | Subscription start date         |
| renewal_date | date      | Renewal / expiry date           |
| created_at   | timestamp | Record creation time            |

---

### 3. charities

Stores supported charity organizations.

| Column      | Type      | Description     |
| ----------- | --------- | --------------- |
| id          | uuid      | Primary key     |
| name        | text      | Charity name    |
| description | text      | Charity details |
| created_at  | timestamp | Created time    |

---

### 4. scores

Stores user Stableford golf scores.

| Column     | Type      | Description            |
| ---------- | --------- | ---------------------- |
| id         | uuid      | Primary key            |
| user_id    | uuid      | References profiles.id |
| score      | integer   | Value between 1 and 45 |
| played_on  | date      | Date score was played  |
| created_at | timestamp | Insert timestamp       |

---

### 5. draws

Stores monthly draw details.

| Column       | Type          | Description              |
| ------------ | ------------- | ------------------------ |
| id           | uuid          | Primary key              |
| draw_month   | text          | Month label              |
| draw_numbers | text[] / json | Generated draw numbers   |
| status       | text          | `pending` or `completed` |
| created_at   | timestamp     | Draw creation time       |

---

### 6. winners

Stores draw winner information.

| Column        | Type      | Description                     |
| ------------- | --------- | ------------------------------- |
| id            | uuid      | Primary key                     |
| draw_id       | uuid      | References draws.id             |
| user_id       | uuid      | References profiles.id          |
| match_tier    | text      | `3-match`, `4-match`, `5-match` |
| reward_amount | numeric   | Prize amount                    |
| created_at    | timestamp | Insert timestamp                |

---

### 7. donations

Tracks charity contribution details.

| Column          | Type      | Description                 |
| --------------- | --------- | --------------------------- |
| id              | uuid      | Primary key                 |
| user_id         | uuid      | References profiles.id      |
| charity_id      | uuid      | References charities.id     |
| subscription_id | uuid      | References subscriptions.id |
| amount          | numeric   | Donation contribution       |
| created_at      | timestamp | Insert timestamp            |

---

## Relationships

* One user has one profile
* One user can have many scores
* One user can have many subscriptions over time
* One user can contribute to one or more charities
* One draw can have many winners
* One subscription can generate one donation entry
