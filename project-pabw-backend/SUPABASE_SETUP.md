# Supabase Setup Guide untuk Backend PABW

## 🔧 Konfigurasi Diperlukan

### 1. Environment Variables
File `.env` sudah diupdate. Kamu perlu **melengkapi** `SUPABASE_SERVICE_ROLE_KEY`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fzoyyootezrzquwidizx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_RPww0d3_ufo_kzT_0ZTnpg_dtkiPM-h
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

**Cara dapat SERVICE_ROLE_KEY:**
- Login ke https://app.supabase.com
- Pilih project PABW
- Settings → API → Service Role Key
- Copy dan paste ke `.env`

---

## 📊 Database Schema di Supabase

Struktur table yang diperlukan (PostgreSQL):

### `company_profile`
```sql
CREATE TABLE company_profile (
  id_company SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `list_hotel`
```sql
CREATE TABLE list_hotel (
  id_list_hotel SERIAL PRIMARY KEY,
  id_company INT REFERENCES company_profile(id_company),
  name VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  city VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `detail_kamar`
```sql
CREATE TABLE detail_kamar (
  id_detail_kamar SERIAL PRIMARY KEY,
  room_type VARCHAR(50),
  description TEXT,
  max_guest INT,
  facilities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `list_kamar`
```sql
CREATE TABLE list_kamar (
  id_kamar SERIAL PRIMARY KEY,
  id_list_hotel INT REFERENCES list_hotel(id_list_hotel),
  id_detail_kamar INT REFERENCES detail_kamar(id_detail_kamar),
  room_number VARCHAR(20),
  price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `user`
```sql
CREATE TABLE user (
  id_user SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  user_type ENUM('admin', 'mitra', 'customer') DEFAULT 'customer',
  name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `session_login`
```sql
CREATE TABLE session_login (
  id_login SERIAL PRIMARY KEY,
  id_user INT REFERENCES user(id_user),
  user_type ENUM('admin', 'mitra', 'customer'),
  status ENUM('active', 'inactive') DEFAULT 'active',
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,
  token VARCHAR(500)
);
```

### `history_purchase`
```sql
CREATE TABLE history_purchase (
  id_purchase SERIAL PRIMARY KEY,
  id_user INT REFERENCES user(id_user),
  id_kamar INT REFERENCES list_kamar(id_kamar),
  check_in_date DATE,
  check_out_date DATE,
  total_price DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `hotel_rating`
```sql
CREATE TABLE hotel_rating (
  id_rating SERIAL PRIMARY KEY,
  id_user INT REFERENCES user(id_user),
  id_list_hotel INT REFERENCES list_hotel(id_list_hotel),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔑 Import Data

Untuk import data dari MySQL ke Supabase:

1. **Dari Supabase Console:**
   - Settings → Import data
   - Upload CSV atau SQL file

2. **Atau gunakan file export:**
   - File `pabw_with_new_data.sql` sudah siap
   - Bisa langsung import di Supabase

---

## 📝 Update Controllers

Setiap controller perlu diupdate dari `mysql2` ke Supabase format.

**Contoh perubahan:**

### Sebelum (MySQL):
```javascript
import pool from "../config/db.js";

const [rows] = await pool.query(
  "SELECT * FROM user WHERE email = ?",
  [email]
);
```

### Sesudah (Supabase):
```javascript
import { selectOne } from "../utils/queryHelper.js";

const user = await selectOne("user", { email: email });
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
cd project-pabw-backend
npm install
```

### 2. Update .env dengan SERVICE_ROLE_KEY

### 3. Update controllers (masih dalam progress)
   - authController.js
   - hotelController.js
   - roomController.js
   - reservationController.js
   - dll

### 4. Test connection
```bash
npm run dev
```

---

## ⚠️ Catatan Penting

1. **Service Role Key** hanya untuk backend - JANGAN di-expose ke frontend
2. PUBLISHABLE_KEY untuk frontend (Next.js client)
3. Semua controllers perlu di-update untuk Supabase format
4. Row Level Security (RLS) di Supabase perlu dikonfigurasi untuk security

---

## 📚 Referensi

- Supabase JS Client: https://supabase.com/docs/reference/javascript
- PostgreSQL vs MySQL: Perhatikan perbedaan tipe data dan syntax
- Supabase Realtime: Bisa enable untuk live updates di booking sistem

