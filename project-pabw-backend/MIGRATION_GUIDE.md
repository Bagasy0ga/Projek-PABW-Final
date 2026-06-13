# Backend Controllers - MySQL to Supabase Migration Guide

## Overview
Semua controllers perlu diupdate dari MySQL (`mysql2`) ke Supabase (PostgreSQL). Panduan ini memberikan template untuk setiap pattern query yang umum.

---

## 🔄 Import Statements

### ❌ SEBELUM (MySQL)
```javascript
import pool from "../config/db.js";
```

### ✅ SESUDAH (Supabase)
```javascript
import { 
  select, 
  selectOne, 
  insert, 
  insertMany,
  update, 
  deleteRecord, 
  count,
  callRpc  // Untuk query kompleks
} from "../utils/queryHelper.js";
```

---

## 📋 Pattern Konversi Queries

### Pattern 1: SELECT dengan WHERE

#### ❌ SEBELUM
```javascript
const [rows] = await pool.query(
  `SELECT * FROM session_login WHERE id_user = ? AND status = ?`,
  [123, 'active']
);
```

#### ✅ SESUDAH
```javascript
const rows = await select("session_login", {
  where: {
    id_user: 123,
    status: 'active'
  }
});
```

---

### Pattern 2: SELECT dengan ORDER BY dan LIMIT

#### ❌ SEBELUM
```javascript
const [rows] = await pool.query(
  `SELECT * FROM session_login WHERE status = ? ORDER BY login_time DESC LIMIT ? OFFSET ?`,
  ['active', 20, 0]
);
```

#### ✅ SESUDAH
```javascript
const rows = await select("session_login", {
  where: { status: 'active' },
  order: { column: 'login_time', ascending: false },
  limit: 20,
  offset: 0
});
```

---

### Pattern 3: SELECT ONE (ambil 1 record)

#### ❌ SEBELUM
```javascript
const [rows] = await pool.query(
  `SELECT * FROM user WHERE email = ? LIMIT 1`,
  ['user@example.com']
);
const user = rows.length > 0 ? rows[0] : null;
```

#### ✅ SESUDAH
```javascript
const user = await selectOne("user", { email: 'user@example.com' });
```

---

### Pattern 4: COUNT

#### ❌ SEBELUM
```javascript
const [[{ total }]] = await pool.query(
  `SELECT COUNT(*) as total FROM list_kamar WHERE id_list_hotel = ?`,
  [456]
);
```

#### ✅ SESUDAH
```javascript
const total = await count("list_kamar", { id_list_hotel: 456 });
```

---

### Pattern 5: INSERT

#### ❌ SEBELUM
```javascript
const [result] = await pool.query(
  `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`,
  ['John', 'john@example.com', 'hashed_password']
);
const userId = result.insertId;
```

#### ✅ SESUDAH
```javascript
const result = await insert("user", {
  name: 'John',
  email: 'john@example.com',
  password: 'hashed_password'
});
const userId = result[0].id_user; // Supabase auto return inserted data
```

---

### Pattern 6: INSERT Multiple

#### ❌ SEBELUM
```javascript
await pool.query(
  `INSERT INTO list_kamar (id_list_hotel, room_number, price) VALUES 
   (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
  [1, 'A101', 350000, 1, 'A102', 350000, 1, 'A103', 350000]
);
```

#### ✅ SESUDAH
```javascript
await insertMany("list_kamar", [
  { id_list_hotel: 1, room_number: 'A101', price: 350000 },
  { id_list_hotel: 1, room_number: 'A102', price: 350000 },
  { id_list_hotel: 1, room_number: 'A103', price: 350000 }
]);
```

---

### Pattern 7: UPDATE

#### ❌ SEBELUM
```javascript
await pool.query(
  `UPDATE list_kamar SET status = ? WHERE id_list_kamar = ?`,
  ['not available', 789]
);
```

#### ✅ SESUDAH
```javascript
await update("list_kamar", 
  { status: 'not available' },
  { id_list_kamar: 789 }
);
```

---

### Pattern 8: DELETE

#### ❌ SEBELUM
```javascript
await pool.query(
  `DELETE FROM session_login WHERE id_login = ?`,
  [123]
);
```

#### ✅ SESUDAH
```javascript
await deleteRecord("session_login", { id_login: 123 });
```

---

### Pattern 9: LIKE Search

#### ❌ SEBELUM
```javascript
const [rows] = await pool.query(
  `SELECT * FROM list_hotel WHERE hotel_name LIKE ? OR location LIKE ?`,
  [`%Bali%`, `%Ubud%`]
);
```

#### ✅ SESUDAH
```javascript
const rows = await select("list_hotel", {
  search: { field: 'hotel_name', value: 'Bali', caseSensitive: false }
});
// Atau untuk multiple fields, gunakan OR conditions
```

---

### Pattern 10: Comparison Operators (>, <, >=, <=)

#### ❌ SEBELUM
```javascript
const [rooms] = await pool.query(
  `SELECT * FROM list_kamar WHERE price >= ? AND price <= ? AND status = ?`,
  [350000, 1000000, 'available']
);
```

#### ✅ SESUDAH
```javascript
const rooms = await select("list_kamar", {
  where: { status: 'available' },
  gte: { price: 350000 },
  lte: { price: 1000000 }
});
```

---

## 🔀 Complex Queries dengan JOIN, GROUP BY, Aggregations

Untuk query kompleks, gunakan **RPC Functions** di Supabase:

### Step 1: Buat RPC Function di Supabase

Login ke Supabase Console → SQL Editor, jalankan:

```sql
-- Contoh RPC function untuk get available rooms dengan aggregations
CREATE OR REPLACE FUNCTION get_available_rooms(p_hotel_id INT)
RETURNS TABLE (
  id_list_hotel INT,
  hotel_name VARCHAR,
  type_room VARCHAR,
  total_rooms INT,
  available_count INT,
  min_price DECIMAL
) AS $$
SELECT
  lh.id_list_hotel,
  lh.hotel_name,
  dk.type_room,
  COUNT(lk.id_list_kamar)::INT,
  SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END)::INT,
  MIN(lk.price)
FROM list_hotel lh
JOIN list_kamar lk ON lh.id_list_hotel = lk.id_list_hotel
JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
WHERE lh.id_list_hotel = p_hotel_id
GROUP BY lh.id_list_hotel, lh.hotel_name, dk.type_room;
$$ LANGUAGE SQL;
```

### Step 2: Panggil dari Controller

#### ❌ SEBELUM
```javascript
const [rooms] = await pool.query(`
  SELECT
    lh.id_list_hotel,
    lh.hotel_name,
    dk.type_room,
    COUNT(lk.id_list_kamar) as total_rooms,
    SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END) as available_count,
    MIN(lk.price) as min_price
  FROM list_hotel lh
  JOIN list_kamar lk ON lh.id_list_hotel = lk.id_list_hotel
  JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
  WHERE lh.id_list_hotel = ?
  GROUP BY lh.id_list_hotel, lh.hotel_name, dk.type_room
`, [hotelId]);
```

#### ✅ SESUDAH
```javascript
const rooms = await callRpc('get_available_rooms', { 
  p_hotel_id: hotelId 
});
```

---

## 🔐 Transactions

Supabase JS client tidak support true transactions. Alternatif:

### Option 1: RPC Function dengan Transactions
Buat RPC function yang handle transaction logic di database:

```sql
CREATE OR REPLACE FUNCTION perform_checkin(
  p_id_history INT,
  p_id_user INT,
  p_checkin_time TIMESTAMP
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Update reservation status
  UPDATE history_purchase 
  SET status = 'checkin', checkin_time = p_checkin_time
  WHERE id_history = p_id_history AND id_user = p_id_user;
  
  -- Update room status
  UPDATE list_kamar
  SET status = 'not available'
  WHERE id_list_kamar = (SELECT id_list_kamar FROM history_purchase WHERE id_history = p_id_history);
  
  SELECT json_build_object(
    'success', true,
    'message', 'Checkin berhasil'
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
```

Panggil dari controller:
```javascript
const result = await callRpc('perform_checkin', {
  p_id_history: historyId,
  p_id_user: userId,
  p_checkin_time: new Date().toISOString()
});
```

### Option 2: Sequential Operations dengan Error Handling
Untuk simple cases tanpa true rollback:

```javascript
try {
  // Operasi 1
  await update("history_purchase", 
    { status: 'checkin' },
    { id_history: historyId }
  );
  
  // Operasi 2
  await update("list_kamar",
    { status: 'not available' },
    { id_list_kamar: roomId }
  );
  
  return { success: true };
} catch (error) {
  // Manual "rollback" - mungkin perlu revert operasi 1
  throw error;
}
```

---

## 📝 Controllers yang Perlu Diupdate

### ✅ DONE (Updated)
- [ ] sessionController.js

### 🔄 IN PROGRESS
- [ ] roomController.js
- [ ] ratingController.js
- [ ] hotelController.js
- [ ] deskripsiHotelController.js

### ⏳ TO DO (Complex - butuh RPC)
- [ ] authController.js (transactions)
- [ ] checkinController.js (transactions)
- [ ] checkoutController.js (transactions)
- [ ] reservationController.js (complex joins)
- [ ] mitraController.js (complex joins + transactions)
- [ ] recommendationController.js (VERY complex - banyak aggregations)

---

## 🚀 Quick Start untuk Simple Controller

1. **Replace imports:**
   ```javascript
   import { select, selectOne, insert, update, deleteRecord, count } from "../utils/queryHelper.js";
   ```

2. **Replace queries:**
   - `pool.query(SELECT...)` → `select()` atau `selectOne()`
   - `pool.query(INSERT...)` → `insert()` atau `insertMany()`
   - `pool.query(UPDATE...)` → `update()`
   - `pool.query(DELETE...)` → `deleteRecord()`
   - `pool.query(COUNT...)` → `count()`

3. **For complex queries:** Gunakan RPC functions

---

## 📚 Contoh Lengkap Controller Update

### hotelController.js (Simple - Copy Paste Template)

```javascript
import { select, selectOne, insert, update, deleteRecord, count } from "../utils/queryHelper.js";
import { successResponse, errorResponse } from "../models/apiResponse.js";

class HotelController {
  // Get all hotels
  static async getAllHotels() {
    try {
      const hotels = await select("list_hotel");
      
      if (!hotels || hotels.length === 0) {
        return errorResponse({ message: "Tidak ada hotel ditemukan" });
      }

      return successResponse({
        message: 'Daftar hotel berhasil diambil',
        data: hotels
      });
    } catch (error) {
      console.error("Error in getAllHotels:", error);
      return errorResponse({ message: error.message });
    }
  }

  // Get hotel by ID
  static async getHotelById(id) {
    try {
      const hotel = await selectOne("list_hotel", { id_list_hotel: parseInt(id) });
      
      if (!hotel) {
        return errorResponse({ message: "Hotel tidak ditemukan" });
      }

      return successResponse({
        message: 'Hotel berhasil diambil',
        data: hotel
      });
    } catch (error) {
      return errorResponse({ message: error.message });
    }
  }

  // Create hotel
  static async createHotel(data) {
    try {
      const hotel = await insert("list_hotel", {
        id_company_profile: data.id_company_profile,
        hotel_name: data.hotel_name,
        location: data.location,
        contact_person: data.contact_person,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone
      });

      return successResponse({
        message: 'Hotel berhasil dibuat',
        data: hotel[0]
      });
    } catch (error) {
      return errorResponse({ message: error.message });
    }
  }

  // Update hotel
  static async updateHotel(id, data) {
    try {
      const hotel = await update(
        "list_hotel",
        {
          hotel_name: data.hotel_name,
          location: data.location,
          contact_person: data.contact_person,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone
        },
        { id_list_hotel: parseInt(id) }
      );

      return successResponse({
        message: 'Hotel berhasil diupdate',
        data: hotel[0]
      });
    } catch (error) {
      return errorResponse({ message: error.message });
    }
  }

  // Delete hotel
  static async deleteHotel(id) {
    try {
      await deleteRecord("list_hotel", { id_list_hotel: parseInt(id) });

      return successResponse({
        message: 'Hotel berhasil dihapus'
      });
    } catch (error) {
      return errorResponse({ message: error.message });
    }
  }
}

export default HotelController;
```

---

## ⚠️ Penting: Perbedaan PostgreSQL vs MySQL

| Feature | MySQL | PostgreSQL |
|---------|-------|-----------|
| Case sensitivity | Insensitive | Sensitive |
| Boolean | TINYINT(1) | BOOLEAN |
| JSON | JSON | JSONB |
| AUTO_INCREMENT | AUTO_INCREMENT | SERIAL |
| LIMIT OFFSET | LIMIT 10 OFFSET 20 | LIMIT 10 OFFSET 20 |
| String concat | CONCAT() | \\|\| |

---

## 🔗 Next Steps

1. Setup semua RPC functions di Supabase (lihat template di atas)
2. Update controllers satu per satu
3. Test setiap endpoint
4. Deploy ke production

---

## 📞 Common Issues & Solutions

### Issue: "Relation 'table_name' does not exist"
**Solusi:** Pastikan table name correct dan eksak (PostgreSQL case-sensitive)

### Issue: "Column name is ambiguous"
**Solusi:** Di Supabase, specify column name dengan format: `table.column`

### Issue: Transaction failed
**Solusi:** Gunakan RPC function untuk logic yang perlu transactions

