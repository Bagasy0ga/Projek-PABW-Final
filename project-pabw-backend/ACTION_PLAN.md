# Backend Supabase Migration - Action Plan

## ✅ Selesai (Ready to Use)

### Files Updated:
1. ✅ `src/config/db.js` - Supabase client configuration
2. ✅ `package.json` - Dependencies (@supabase/supabase-js added)
3. ✅ `src/utils/queryHelper.js` - Query abstraction layer (IMPROVED)
4. ✅ `src/controllers/sessionController.js` - Pattern example #1
5. ✅ `src/controllers/hotelController.js` - Pattern example #2

### Files Created:
- ✅ `SUPABASE_SETUP.md` - Database schema & setup instructions
- ✅ `MIGRATION_GUIDE.md` - Complete pattern conversion guide
- ✅ `ACTION_PLAN.md` (this file)

---

## 🚀 Next Steps (YANG HARUS KAMU LAKUKAN)

### STEP 1: Environment Setup (15 menit)

1. **Login ke Supabase Console:**
   - https://app.supabase.com
   - Pilih project PABW

2. **Copy Service Role Key:**
   - Settings → API
   - Copy "Service Role Key" (bukan Publishable Key)
   - Update `.env`:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=<paste_key_here>
     ```

3. **Verifikasi URLs di `.env`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://fzoyyootezrzquwidizx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_RPww0d3_ufo_kzT_0ZTnpg_dtkiPM-h
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

### STEP 2: Database Setup (30 menit)

1. **Create Tables di Supabase:**
   - Buka Supabase Console → SQL Editor
   - Copy-paste semua dari `SUPABASE_SETUP.md`
   - Execute

2. **Create RPC Functions (untuk complex queries):**
   - Use SQL templates dari `MIGRATION_GUIDE.md`
   - Buat untuk: `get_available_rooms`, `perform_checkin`, dll

### STEP 3: Update Controllers (Butuh 2-4 jam)

**Option A: Manual (step-by-step)**
- Follow `MIGRATION_GUIDE.md`
- Update 1 controller at a time
- Test setiap endpoint

**Option B: Copy Template**
- Simple controllers (ratingController, deskripsiHotelController)
- Medium controllers (roomController, mitraController)
- Complex controllers (authController, reservationController)

### STEP 4: Testing

```bash
cd project-pabw-backend
npm install
npm run dev
```

Test endpoints dengan Postman Collection

---

## 📋 Controller Priority & Difficulty

### 🟢 EASY (15 min each)
- [ ] `ratingController.js` - Simple CRUD + inserts
- [ ] `deskripsiHotelController.js` - Simple joins
- [ ] `roomController.js` - Aggregate queries

### 🟡 MEDIUM (30 min each)
- [ ] `mitraController.js` - Complex queries + joins
- [ ] `reservationController.js` - Complex filters + joins

### 🔴 HARD (45+ min each - butuh RPC functions)
- [ ] `authController.js` - Transactions + sessions
- [ ] `checkinController.js` - Transactions
- [ ] `checkoutController.js` - Transactions
- [ ] `recommendationController.js` - Very complex aggregations

---

## 🔧 Update Controllers - Quick Reference

### Imports (Copy-Paste)
```javascript
// REMOVE THIS:
// import pool from "../config/db.js";

// ADD THIS:
import { 
  select, 
  selectOne, 
  insert, 
  insertMany,
  update, 
  deleteRecord, 
  count,
  callRpc 
} from "../utils/queryHelper.js";
```

### Query Replacements

| MySQL Pattern | Supabase Alternative |
|---------------|---------------------|
| `pool.query(SELECT * FROM table WHERE x=?)` | `select("table", { where: {x: value} })` |
| `pool.query(SELECT * FROM table LIMIT 1)` | `selectOne("table", where)` |
| `pool.query(INSERT INTO table VALUES...)` | `insert("table", data)` |
| `pool.query(UPDATE table SET...)` | `update("table", data, where)` |
| `pool.query(DELETE FROM table...)` | `deleteRecord("table", where)` |
| Complex JOINs + aggregations | `callRpc('function_name', params)` |

---

## 📚 Files to Review (In Order)

1. **FIRST:** `SUPABASE_SETUP.md` - Understand database structure
2. **THEN:** `MIGRATION_GUIDE.md` - Understand query patterns
3. **REFERENCE:** `sessionController.js` - Template #1
4. **REFERENCE:** `hotelController.js` - Template #2
5. **NOW:** Update remaining 9 controllers

---

## ⚠️ Common Pitfalls

### ❌ Don't:
- Forget to add SERVICE_ROLE_KEY ke .env
- Use mysql2 `pool.query()` syntax
- Forget to convert WHERE clauses to object format
- Use LIMIT without offset syntax

### ✅ Do:
- Use helper functions dari queryHelper.js
- Test each endpoint after update
- For complex queries, create RPC functions
- Use proper type conversions (parseInt, parseFloat)

---

## 🧪 Testing Checklist

After updating each controller:

- [ ] Run `npm run dev` tanpa errors
- [ ] Test GET endpoints dengan Postman
- [ ] Test POST/PUT/DELETE endpoints
- [ ] Verify response format matches old format
- [ ] Check error handling

---

## 📞 Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY belum diisi"
**Fix:** Pastikan .env sudah lengkap, restart `npm run dev`

### Error: "Relation 'table_name' does not exist"
**Fix:** Table names PostgreSQL case-sensitive, check huruf besar-kecilnya

### Error: "Column doesn't exist"
**Fix:** Cek column names di Supabase (bisa beda dari MySQL)

### Queries not working?
**Fix:** Check `MIGRATION_GUIDE.md` untuk pattern yang sesuai

---

## 🎯 Success Criteria

✅ Semua controllers updated ke Supabase
✅ Semua RPC functions created untuk complex queries
✅ All endpoints tested dan working
✅ Error handling works properly
✅ Database schema imported ke Supabase
✅ No console errors saat npm run dev

---

## 📅 Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Setup Supabase env | 15 min | ⏳ TODO |
| Create database tables | 30 min | ⏳ TODO |
| Create RPC functions | 45 min | ⏳ TODO |
| Update simple controllers (3x) | 45 min | ⏳ TODO |
| Update medium controllers (2x) | 60 min | ⏳ TODO |
| Update complex controllers (4x) | 120 min | ⏳ TODO |
| Testing & fixes | 30 min | ⏳ TODO |
| **TOTAL** | **~4 hours** | |

---

## 📖 Reference Links

- Supabase JS Docs: https://supabase.com/docs/reference/javascript
- Migration Guide: `./MIGRATION_GUIDE.md`
- Setup Guide: `./SUPABASE_SETUP.md`
- Query Helper: `./src/utils/queryHelper.js`

---

## ✨ Ready? Start dengan Step 1 di atas! 🚀
