-- ============================================
-- SUPABASE RPC FUNCTIONS untuk PABW Backend
-- ============================================
-- Jalankan semua function ini di Supabase SQL Editor
-- Settings → SQL Editor → copy-paste seluruh file ini dan execute

-- ============================================
-- 1. RPC untuk RATING CONTROLLER
-- ============================================

-- Insert atau update hotel rating (handle duplicate key logic)
CREATE OR REPLACE FUNCTION insert_or_update_hotel_rating(
  p_id_user INT,
  p_id_list_hotel INT,
  p_id_history INT,
  p_rating INT,
  p_review TEXT DEFAULT NULL
)
RETURNS TABLE (
  id_rating BIGINT,
  id_user INT,
  customer_name VARCHAR,
  id_list_hotel INT,
  hotel_name VARCHAR,
  id_history INT,
  rating INT,
  review TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  -- Insert atau update dengan ON CONFLICT
  INSERT INTO hotel_rating (id_user, id_list_hotel, id_history, rating, review)
  VALUES (p_id_user, p_id_list_hotel, p_id_history, p_rating, p_review)
  ON CONFLICT (id_user, id_list_hotel) DO UPDATE SET
    rating = p_rating,
    review = p_review,
    updated_at = NOW();

  -- Return hasil
  RETURN QUERY
  SELECT
    hr.id_rating,
    hr.id_user,
    u.name AS customer_name,
    hr.id_list_hotel,
    lh.hotel_name,
    hr.id_history,
    hr.rating,
    hr.review,
    hr.created_at,
    hr.updated_at
  FROM hotel_rating hr
  JOIN "user" u ON hr.id_user = u.id_user
  JOIN list_hotel lh ON hr.id_list_hotel = lh.id_list_hotel
  WHERE hr.id_history = p_id_history
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get hotel ratings dengan summary
CREATE OR REPLACE FUNCTION get_hotel_ratings(
  p_id_list_hotel INT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  total_rating BIGINT,
  rata_rata_rating NUMERIC,
  ratings JSON
) AS $$
DECLARE
  v_summary RECORD;
  v_ratings JSON;
BEGIN
  -- Get summary
  SELECT COUNT(*), COALESCE(AVG(rating), 0) INTO v_summary
  FROM hotel_rating
  WHERE id_list_hotel = p_id_list_hotel;

  -- Get ratings dengan JOIN
  SELECT json_agg(row_to_json(t))
  INTO v_ratings
  FROM (
    SELECT
      hr.id_rating,
      hr.id_user,
      u.name AS customer_name,
      hr.id_list_hotel,
      lh.hotel_name,
      hr.id_history,
      hr.rating,
      hr.review,
      hr.created_at,
      hr.updated_at
    FROM hotel_rating hr
    JOIN "user" u ON hr.id_user = u.id_user
    JOIN list_hotel lh ON hr.id_list_hotel = lh.id_list_hotel
    WHERE hr.id_list_hotel = p_id_list_hotel
    ORDER BY hr.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) t;

  RETURN QUERY
  SELECT v_summary.count, v_summary.avg, v_ratings;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. RPC untuk ROOM CONTROLLER
-- ============================================

-- Get available rooms dengan aggregations
CREATE OR REPLACE FUNCTION get_available_rooms(
  p_id_list_hotel INT,
  p_type_room VARCHAR DEFAULT NULL,
  p_capacity INT DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id_list_hotel INT,
  hotel_name VARCHAR,
  location VARCHAR,
  id_detail_kamar INT,
  type_room VARCHAR,
  description TEXT,
  facility TEXT,
  capacity INT,
  price DECIMAL,
  total_rooms BIGINT,
  available_count BIGINT,
  unavailable_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lh.id_list_hotel,
    lh.hotel_name,
    lh.location,
    dk.id_detail_kamar,
    dk.type_room,
    dk.description,
    dk.facility,
    dk.capacity,
    MIN(lk.price)::DECIMAL,
    COUNT(lk.id_list_kamar)::BIGINT,
    SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END)::BIGINT,
    SUM(CASE WHEN lk.status != 'available' THEN 1 ELSE 0 END)::BIGINT
  FROM list_kamar lk
  JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
  JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
  WHERE lh.id_list_hotel = p_id_list_hotel
    AND (p_type_room IS NULL OR dk.type_room ILIKE '%' || p_type_room || '%')
    AND (p_capacity IS NULL OR dk.capacity >= p_capacity)
    AND (p_min_price IS NULL OR lk.price >= p_min_price)
    AND (p_max_price IS NULL OR lk.price <= p_max_price)
  GROUP BY
    lh.id_list_hotel, lh.hotel_name, lh.location,
    dk.id_detail_kamar, dk.type_room, dk.description, dk.facility, dk.capacity
  HAVING SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END) > 0
  ORDER BY dk.type_room ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get room availability summary
CREATE OR REPLACE FUNCTION get_room_availability(
  p_id_company_profile INT DEFAULT NULL,
  p_id_list_hotel INT DEFAULT NULL,
  p_include_rooms BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id_list_hotel INT,
  hotel_name VARCHAR,
  total_kamar BIGINT,
  kamar_tersedia BIGINT,
  kamar_tidak_tersedia BIGINT,
  rooms JSON
) AS $$
DECLARE
  v_rooms JSON;
BEGIN
  RETURN QUERY
  SELECT
    lh.id_list_hotel,
    lh.hotel_name,
    COUNT(lk.id_list_kamar)::BIGINT,
    SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END)::BIGINT,
    SUM(CASE WHEN lk.status = 'not available' THEN 1 ELSE 0 END)::BIGINT,
    CASE
      WHEN p_include_rooms THEN
        (SELECT json_agg(row_to_json(t)) FROM (
          SELECT
            lk.id_list_kamar,
            lk.room_number,
            lk.price,
            lk.status,
            lh.id_list_hotel,
            lh.hotel_name,
            dk.id_detail_kamar,
            dk.type_room,
            dk.capacity
          FROM list_kamar lk
          JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
          JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
          WHERE (p_id_company_profile IS NULL OR lh.id_company_profile = p_id_company_profile)
            AND (p_id_list_hotel IS NULL OR lh.id_list_hotel = p_id_list_hotel)
          ORDER BY lh.hotel_name ASC, lk.room_number ASC
        ) t)
      ELSE NULL::JSON
    END
  FROM list_hotel lh
  LEFT JOIN list_kamar lk ON lh.id_list_hotel = lk.id_list_hotel
  WHERE (p_id_company_profile IS NULL OR lh.id_company_profile = p_id_company_profile)
    AND (p_id_list_hotel IS NULL OR lh.id_list_hotel = p_id_list_hotel)
  GROUP BY lh.id_list_hotel, lh.hotel_name
  ORDER BY lh.hotel_name ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. RPC untuk CHECKIN/CHECKOUT CONTROLLER (Transactions)
-- ============================================

-- Perform checkin dengan transaction
CREATE OR REPLACE FUNCTION perform_checkin(
  p_id_history INT,
  p_id_user INT,
  p_checkin_time TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR,
  data JSON
) AS $$
DECLARE
  v_reservation RECORD;
  v_booked_checkin_time TIMESTAMP;
  v_current_time TIMESTAMP;
  v_result JSON;
BEGIN
  v_current_time := COALESCE(p_checkin_time, NOW());

  -- Get reservation data
  SELECT hp.*, lk.id_list_kamar, lk.status AS room_status, lh.hotel_name
  INTO v_reservation
  FROM history_purchase hp
  JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
  JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
  WHERE hp.id_history = p_id_history AND hp.id_user = p_id_user AND hp.status = 'confirmed'
  LIMIT 1;

  -- Check if reservation exists
  IF v_reservation IS NULL THEN
    RETURN QUERY
    SELECT FALSE, 'Reservasi tidak ditemukan atau status bukan confirmed'::VARCHAR, NULL::JSON;
    RETURN;
  END IF;

  v_booked_checkin_time := v_reservation.checkin_time;

  -- Check if checkin time is valid
  IF v_current_time < v_booked_checkin_time THEN
    RETURN QUERY
    SELECT FALSE, 'Waktu checkin lebih awal dari jadwal'::VARCHAR, NULL::JSON;
    RETURN;
  END IF;

  -- Begin transaction-like operations
  BEGIN
    -- Update history_purchase status
    UPDATE history_purchase
    SET status = 'checkin', checkin_time = v_current_time
    WHERE id_history = p_id_history AND id_user = p_id_user AND status = 'confirmed';

    -- Update room status
    UPDATE list_kamar
    SET status = 'not available'
    WHERE id_list_kamar = v_reservation.id_list_kamar;

    -- Get updated data
    SELECT json_build_object(
      'id_history', hp.id_history,
      'id_user', hp.id_user,
      'id_list_kamar', hp.id_list_kamar,
      'status', hp.status,
      'checkin_time', hp.checkin_time,
      'hotel_name', lh.hotel_name,
      'room_number', lk.room_number
    )
    INTO v_result
    FROM history_purchase hp
    JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
    JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
    WHERE hp.id_history = p_id_history;

    RETURN QUERY
    SELECT TRUE, 'Checkin berhasil'::VARCHAR, v_result;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT FALSE, SQLERRM::VARCHAR, NULL::JSON;
  END;
END;
$$ LANGUAGE plpgsql;

-- Perform checkout dengan transaction
CREATE OR REPLACE FUNCTION perform_checkout(
  p_id_history INT,
  p_id_user INT,
  p_checkout_time TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR,
  data JSON
) AS $$
DECLARE
  v_reservation RECORD;
  v_current_time TIMESTAMP;
  v_result JSON;
BEGIN
  v_current_time := COALESCE(p_checkout_time, NOW());

  -- Get reservation data
  SELECT hp.*, lk.id_list_kamar, lh.hotel_name
  INTO v_reservation
  FROM history_purchase hp
  JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
  JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
  WHERE hp.id_history = p_id_history AND hp.id_user = p_id_user AND hp.status = 'checkin'
  LIMIT 1;

  -- Check if reservation exists
  IF v_reservation IS NULL THEN
    RETURN QUERY
    SELECT FALSE, 'Reservasi tidak ditemukan atau status bukan checkin'::VARCHAR, NULL::JSON;
    RETURN;
  END IF;

  BEGIN
    -- Update history_purchase status
    UPDATE history_purchase
    SET status = 'checkout', checkout_time = v_current_time
    WHERE id_history = p_id_history AND id_user = p_id_user AND status = 'checkin';

    -- Update room status back to available
    UPDATE list_kamar
    SET status = 'available'
    WHERE id_list_kamar = v_reservation.id_list_kamar;

    -- Get updated data
    SELECT json_build_object(
      'id_history', hp.id_history,
      'id_user', hp.id_user,
      'status', hp.status,
      'checkout_time', hp.checkout_time,
      'hotel_name', lh.hotel_name
    )
    INTO v_result
    FROM history_purchase hp
    JOIN list_hotel lh ON (SELECT id_list_hotel FROM list_kamar WHERE id_list_kamar = hp.id_list_kamar)
    WHERE hp.id_history = p_id_history;

    RETURN QUERY
    SELECT TRUE, 'Checkout berhasil'::VARCHAR, v_result;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT FALSE, SQLERRM::VARCHAR, NULL::JSON;
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. RPC untuk RESERVATION CONTROLLER
-- ============================================

-- Create reservation dengan support single/grouped booking
CREATE OR REPLACE FUNCTION create_reservation(
  p_id_user INT,
  p_id_list_hotel INT DEFAULT NULL,
  p_id_detail_kamar INT DEFAULT NULL,
  p_id_list_kamar INT DEFAULT NULL,
  p_jumlah_kamar INT DEFAULT 1,
  p_checkin_time TIMESTAMP,
  p_checkout_time TIMESTAMP
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR,
  data JSON
) AS $$
DECLARE
  v_user RECORD;
  v_rooms RECORD;
  v_room_count INT;
  v_requested_count INT;
  v_is_grouped BOOLEAN;
  v_history_ids INT[] := '{}'::INT[];
  v_total_amount DECIMAL := 0;
  v_room_ids INT[] := '{}'::INT[];
  v_first_room RECORD;
  v_result JSON;
  v_days INT;
  v_room_data JSONB;
BEGIN
  -- Validate dates
  IF p_checkout_time <= p_checkin_time THEN
    RETURN QUERY
    SELECT FALSE, 'checkout_time harus lebih besar dari checkin_time'::VARCHAR, NULL::JSON;
    RETURN;
  END IF;

  v_requested_count := COALESCE(p_jumlah_kamar, 1);
  v_is_grouped := (p_id_list_hotel IS NOT NULL AND p_id_detail_kamar IS NOT NULL);

  -- Validate parameters
  IF NOT v_is_grouped AND p_id_list_kamar IS NULL THEN
    RETURN QUERY
    SELECT FALSE, 'id_list_kamar atau kombinasi id_list_hotel dan id_detail_kamar wajib diisi'::VARCHAR, NULL::JSON;
    RETURN;
  END IF;

  -- Check user exists
  SELECT * INTO v_user
  FROM "user"
  WHERE id_user = p_id_user
  LIMIT 1;

  IF v_user IS NULL THEN
    RETURN QUERY
    SELECT FALSE, 'User tidak ditemukan'::VARCHAR, NULL::JSON;
    RETURN;
  END IF;

  -- Calculate days
  v_days := GREATEST(1, CEIL(EXTRACT(DAY FROM (p_checkout_time - p_checkin_time))));

  BEGIN
    -- Get rooms to book
    IF v_is_grouped THEN
      -- Grouped booking: get multiple available rooms
      WITH room_list AS (
        SELECT
          lk.id_list_kamar,
          lk.room_number,
          lk.price,
          lk.status,
          lk.id_detail_kamar,
          lh.id_list_hotel,
          lh.id_company_profile,
          lh.hotel_name,
          lh.location,
          dk.type_room,
          dk.capacity
        FROM list_kamar lk
        JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
        JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
        WHERE lh.id_list_hotel = p_id_list_hotel
          AND lk.id_detail_kamar = p_id_detail_kamar
          AND lk.status = 'available'
        ORDER BY lk.room_number ASC
        LIMIT v_requested_count
      )
      SELECT COUNT(*)::INT INTO v_room_count FROM room_list;

      IF v_room_count < v_requested_count THEN
        RETURN QUERY
        SELECT FALSE, ('Kamar tersedia tidak cukup. Diminta ' || v_requested_count || ', tersedia ' || v_room_count)::VARCHAR, NULL::JSON;
        RETURN;
      END IF;

      -- Insert reservations
      WITH room_list AS (
        SELECT
          lk.id_list_kamar,
          lk.room_number,
          lk.price,
          lh.id_company_profile,
          lh.hotel_name,
          lh.location,
          dk.type_room,
          dk.capacity
        FROM list_kamar lk
        JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
        JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
        WHERE lh.id_list_hotel = p_id_list_hotel
          AND lk.id_detail_kamar = p_id_detail_kamar
          AND lk.status = 'available'
        ORDER BY lk.room_number ASC
        LIMIT v_requested_count
      ),
      inserted_reservations AS (
        INSERT INTO history_purchase (id_user, id_company_profile, id_list_kamar, purchase_date, checkin_time, checkout_time, amount, status)
        SELECT
          p_id_user,
          rl.id_company_profile,
          rl.id_list_kamar,
          NOW(),
          p_checkin_time,
          p_checkout_time,
          rl.price::DECIMAL * v_days,
          'confirmed'
        FROM room_list rl
        RETURNING id_history, id_list_kamar, amount
      )
      SELECT
        ARRAY_AGG(ir.id_history),
        SUM(ir.amount)::DECIMAL
      INTO v_history_ids, v_total_amount
      FROM inserted_reservations ir;

      -- Get room IDs to update
      SELECT ARRAY_AGG(id_list_kamar)
      INTO v_room_ids
      FROM history_purchase
      WHERE id_history = ANY(v_history_ids);

    ELSE
      -- Single room booking
      SELECT
        lk.id_list_kamar,
        lk.room_number,
        lk.price,
        lk.id_detail_kamar,
        lh.id_list_hotel,
        lh.id_company_profile,
        lh.hotel_name,
        lh.location,
        dk.type_room,
        dk.capacity
      INTO v_first_room
      FROM list_kamar lk
      JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
      JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
      WHERE lk.id_list_kamar = p_id_list_kamar
      LIMIT 1;

      IF v_first_room IS NULL THEN
        RETURN QUERY
        SELECT FALSE, 'Kamar tidak ditemukan'::VARCHAR, NULL::JSON;
        RETURN;
      END IF;

      IF v_first_room.status != 'available' THEN
        RETURN QUERY
        SELECT FALSE, 'Kamar tidak tersedia untuk dipesan'::VARCHAR, NULL::JSON;
        RETURN;
      END IF;

      -- Insert single reservation
      INSERT INTO history_purchase (id_user, id_company_profile, id_list_kamar, purchase_date, checkin_time, checkout_time, amount, status)
      VALUES (p_id_user, v_first_room.id_company_profile, v_first_room.id_list_kamar, NOW(), p_checkin_time, p_checkout_time, v_first_room.price::DECIMAL * v_days, 'confirmed')
      RETURNING id_history INTO v_room_ids[1];

      v_history_ids[1] := v_room_ids[1];
      v_total_amount := v_first_room.price::DECIMAL * v_days;
      v_room_ids[1] := v_first_room.id_list_kamar;
    END IF;

    -- Update room statuses to 'not available'
    UPDATE list_kamar
    SET status = 'not available'
    WHERE id_list_kamar = ANY(v_room_ids);

    -- Build response
    SELECT json_build_object(
      'id_history', v_history_ids[1],
      'history_ids', v_history_ids,
      'id_user', p_id_user,
      'id_list_hotel', COALESCE(p_id_list_hotel, (SELECT id_list_hotel FROM list_kamar WHERE id_list_kamar = v_room_ids[1])),
      'id_detail_kamar', p_id_detail_kamar,
      'checkin_time', p_checkin_time,
      'checkout_time', p_checkout_time,
      'total_malam', v_days,
      'total_amount', v_total_amount,
      'jumlah_kamar', ARRAY_LENGTH(v_room_ids, 1),
      'status', 'confirmed'
    )
    INTO v_result;

    RETURN QUERY
    SELECT TRUE, 'Reservasi kamar berhasil dibuat'::VARCHAR, v_result;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT FALSE, SQLERRM::VARCHAR, NULL::JSON;
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. RPC untuk RECOMMENDATION CONTROLLER
-- ============================================

-- Get hotel recommendations dengan complex GROUP BY
CREATE OR REPLACE FUNCTION get_hotel_recommendations(
  p_location VARCHAR DEFAULT NULL,
  p_budget_max DECIMAL DEFAULT NULL,
  p_guest_count INT DEFAULT NULL,
  p_limit INT DEFAULT 30
)
RETURNS TABLE (
  id_list_hotel INT,
  hotel_name VARCHAR,
  location VARCHAR,
  contact_person VARCHAR,
  contact_email VARCHAR,
  contact_phone VARCHAR,
  available_room_count BIGINT,
  min_price DECIMAL,
  max_price DECIMAL,
  max_capacity INT,
  available_room_types VARCHAR,
  all_facilities TEXT,
  avg_rating NUMERIC,
  total_rating BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lh.id_list_hotel,
    lh.hotel_name,
    lh.location,
    lh.contact_person,
    lh.contact_email,
    lh.contact_phone,
    COUNT(DISTINCT lk.id_list_kamar)::BIGINT,
    MIN(lk.price)::DECIMAL,
    MAX(lk.price)::DECIMAL,
    MAX(dk.capacity),
    STRING_AGG(DISTINCT dk.type_room, ', ' ORDER BY dk.type_room),
    STRING_AGG(DISTINCT dk.facility, ', '),
    COALESCE(AVG(hr.rating)::NUMERIC, 0),
    COUNT(DISTINCT hr.id_rating)::BIGINT
  FROM list_hotel lh
  JOIN list_kamar lk ON lk.id_list_hotel = lh.id_list_hotel
  JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
  LEFT JOIN hotel_rating hr ON hr.id_list_hotel = lh.id_list_hotel
  WHERE lk.status = 'available'
    AND (p_location IS NULL OR LOWER(lh.location) ILIKE '%' || LOWER(p_location) || '%'
         OR LOWER(lh.hotel_name) ILIKE '%' || LOWER(p_location) || '%')
    AND (p_budget_max IS NULL OR lk.price <= p_budget_max)
    AND (p_guest_count IS NULL OR dk.capacity >= p_guest_count)
  GROUP BY
    lh.id_list_hotel, lh.hotel_name, lh.location, lh.contact_person,
    lh.contact_email, lh.contact_phone
  ORDER BY MIN(lk.price) ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Notes untuk Migrasi:
-- ============================================
-- 1. Jalankan ALL function di atas di Supabase SQL Editor
-- 2. Test masing-masing RPC function di Supabase SQL Editor
-- 3. Setelah sukses, backend controller bisa dipanggil dengan callRpc()
--
-- Contoh pemanggilan dari controller:
-- const result = await callRpc('get_available_rooms', {
--   p_id_list_hotel: 1,
--   p_limit: 20,
--   p_offset: 0
-- });
