-- Fix get_available_rooms function to return all room types
-- INCLUDING unavailable rooms (the HAVING clause was filtering them out)

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
  ORDER BY dk.type_room ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
