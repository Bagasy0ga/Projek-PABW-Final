# 🚀 Panduan Lengkap Migrasi ke Supabase - PABW Backend

## Status Migrasi Saat Ini

### ✅ SUDAH DIMIGRASI
- [x] **deskripsiHotelController.js** - Simple CRUD + JOINs
- [x] **ratingController.js** - RPC Functions untuk kompleks queries dengan JOINs & aggregates
- [x] **roomController.js** - RPC Functions untuk aggregations & GROUP BY
- [x] **hotelController.js** - Already done (menggunakan queryHelper)
- [x] **sessionController.js** - Already done (menggunakan queryHelper)

### 🔄 BELUM DIMIGRASI
- [ ] **authController.js** - Complex (transactions, password hashing, sessions)
- [ ] **checkinController.js** - Hard (transactions dengan rollback)
- [ ] **checkoutController.js** - Hard (transactions dengan rollback)
- [ ] **mitraController.js** - Medium (multiple queries)
- [ ] **reservationController.js** - Medium/Hard (complex logic + JOINs)
- [ ] **recommendationController.js** - Hard (complex aggregations & AI logic)

---

## ⚠️ LANGKAH YANG HARUS DILAKUKAN USER

### STEP 1: Setup Environment & RPC Functions (5-10 menit)

#### 1.1 Update .env dengan Service Role Key
```bash
# Di: project-pabw-backend/.env

# REPLACE:
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# DENGAN Service Role Key dari Supabase:
# 1. Buka https://app.supabase.com
# 2. Pilih project PABW
# 3. Settings → API → Copy "Service Role Key"
# 4. Paste ke .env
```

#### 1.2 Execute RPC Functions di Supabase
```bash
# File sudah dibuat: SUPABASE_RPC_FUNCTIONS.sql
# 
# Langkah:
# 1. Buka Supabase Console → SQL Editor
# 2. Copy semua isi dari file: SUPABASE_RPC_FUNCTIONS.sql
# 3. Paste ke Supabase SQL Editor
# 4. Klik "RUN" atau Ctrl+Enter
# 5. Tunggu sampai selesai
#
# Jika ada error, baca pesan error dan fix di SQL file
```

**RPC Functions yang akan di-create:**
- `insert_or_update_hotel_rating` - Handle duplicate rating insert/update
- `get_hotel_ratings` - Get ratings dengan aggregates (COUNT, AVG)
- `get_available_rooms` - Get available rooms dengan GROUP BY & JOINs
- `get_room_availability` - Get summary kamar per hotel
- `perform_checkin` - Checkin transaction
- `perform_checkout` - Checkout transaction

### STEP 2: Test Backend Local (5 menit)

```bash
cd project-pabw-backend

# Install dependencies (jika belum)
npm install

# Run server
npm run dev

# Server akan jalan di localhost:3000
```

**Test endpoints yang sudah dimigrasi:**
- POST /api/rating/{id_list_hotel} - Create/update rating
- GET /api/rating/{id_list_hotel} - Get hotel ratings
- POST /api/room - Create room
- GET /api/room/categories - Get room categories
- GET /api/room/available - Get available rooms
- GET /api/room/availability - Get room availability

---

## MIGRASI CONTROLLERS LANJUTAN

### MEDIUM Priority (30-45 menit masing-masing)

#### 1. mitraController.js
**Status:** Belum dimulai
**Kebutuhan:** Query dengan JOINs multiple tables
**Approach:** Bisa langsung pake queryHelper (simpler queries)

```javascript
// Import pattern
import { select, selectOne, insert, update, deleteRecord } from "../utils/queryHelper.js";

// Example: selectOne dengan where conditions
const mitra = await selectOne("mitra", { id_mitra: mitraId });
```

#### 2. reservationController.js
**Status:** Belum dimulai
**Kebutuhan:** Complex queries + business logic
**Approach:** Mix queryHelper + RPC functions

```javascript
// Simple operations dengan queryHelper
const reservation = await selectOne("history_purchase", { id_history: historyId });

// Complex operations dengan RPC (if needed)
const result = await callRpc("rpc_function_name", { params });
```

### HARD Priority (1-2 jam masing-masing)

#### 3. authController.js
**Status:** Belum dimulai
**Kebutuhan:** Transactions, password hashing, JWT, OTP
**Approach:** 
- Keep bcryptjs, jsonwebtoken (already in package.json)
- Keep sendMail function (already exists)
- Replace pool.query dengan queryHelper
- Untuk transaction logic, cek apakah bisa langsung atau perlu RPC

**Controllers yang mungkin butuh RPC:**
- Register user (insert ke user + company profile?)
- Login (check password hash)

#### 4. checkinController.js
**Status:** Belum dimulai
**Kebutuhan:** Transactions (update multiple tables)
**Approach:** 
- RPC function sudah ada: `perform_checkin`
- Replace getConnection().query dengan callRpc

```javascript
// Replace transaction logic dengan:
const result = await callRpc("perform_checkin", {
  p_id_history: historyId,
  p_id_user: userId,
  p_checkin_time: new Date()
});
```

#### 5. checkoutController.js
**Status:** Belum dimulai
**Kebutuhan:** Transactions (update multiple tables)
**Approach:** 
- RPC function sudah ada: `perform_checkout`
- Sama pattern dengan checkinController

#### 6. recommendationController.js
**Status:** Belum dimulai
**Kebutuhan:** Complex AI logic + aggregations
**Approach:** 
- Cek current implementation
- Mungkin perlu tambahan RPC functions untuk recommendation logic
- Atau bisa gunakan Ollama + queryHelper untuk fetching data

---

## CHECKLIST UNTUK MILESTONES

### Milestone 1: ✅ DONE
- [x] Setup Supabase client (db.js)
- [x] Create queryHelper.js
- [x] Migrate deskripsiHotelController
- [x] Migrate ratingController + RPC functions
- [x] Migrate roomController + RPC functions
- [ ] **USER ACTION:** Execute RPC functions di Supabase
- [ ] **USER ACTION:** Test endpoints di localhost:3000

### Milestone 2: Basic CRUD Controllers
- [ ] Migrate mitraController
- [ ] Migrate authController (partial - basic auth)
- [ ] Migrate reservationController (basic CRUD)
- [ ] Test all basic endpoints
- [ ] Deploy to Supabase

### Milestone 3: Complex Features
- [ ] Migrate checkinController (using RPC)
- [ ] Migrate checkoutController (using RPC)
- [ ] Migrate recommendationController
- [ ] Full integration testing
- [ ] Performance optimization

---

## TOOLS & UTILITIES YANG SUDAH READY

### queryHelper.js Functions
```javascript
select(table, options)          // SELECT with WHERE, ORDER, LIMIT
selectOne(table, where)         // SELECT LIMIT 1
insert(table, data)             // INSERT
insertMany(table, dataArray)    // INSERT multiple rows
update(table, data, where)      // UPDATE
deleteRecord(table, where)      // DELETE
count(table, where)             // COUNT
callRpc(functionName, params)   // Call RPC functions
```

### Usage Examples
```javascript
// Simple select
const users = await select("user", {
  where: { role: 'admin' },
  order: { column: 'name', ascending: true },
  limit: 10,
  offset: 0
});

// Select one
const user = await selectOne("user", { email: 'test@example.com' });

// Insert
const result = await insert("user", {
  name: 'John',
  email: 'john@example.com',
  role: 'customer'
});

// Update
await update("user", { role: 'admin' }, { id_user: 123 });

// Delete
await deleteRecord("user", { id_user: 123 });

// Count
const total = await count("user", { role: 'customer' });

// RPC
const ratings = await callRpc("get_hotel_ratings", {
  p_id_list_hotel: 1,
  p_limit: 20,
  p_offset: 0
});
```

---

## TROUBLESHOOTING

### Error: "SUPABASE_SERVICE_ROLE_KEY belum diisi"
**Solution:** Update .env dengan Service Role Key dari Supabase

### Error: "RPC function not found"
**Solution:** Execute SUPABASE_RPC_FUNCTIONS.sql di Supabase SQL Editor

### Error: "Table not found"
**Solution:** Pastikan database schema sudah ada di Supabase. Buka Supabase Console → Tables untuk verifikasi

### Error: "Foreign key constraint failed"
**Solution:** Pastikan parent record ada sebelum insert child record

---

## NEXT ACTIONS

1. ✅ **Done by me:** Backend infrastructure + 5 controllers migrated + RPC functions created
2. ⏳ **Waiting for you:**
   - Add Service Role Key ke .env
   - Execute RPC functions di Supabase
   - Test endpoints
3. ⏳ **Then:** Migrate remaining controllers berdasarkan priority

---

## REFERENCE DOCS

- Supabase JS Client: https://supabase.com/docs/reference/javascript
- Supabase RPC: https://supabase.com/docs/guides/api/rpc
- queryHelper.js: `./src/utils/queryHelper.js`
- RPC Functions SQL: `./SUPABASE_RPC_FUNCTIONS.sql`
