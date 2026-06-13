-- Create get_available_hotels_with_filters RPC function
-- This function filters hotels by location, budget, and guest count
-- Returns hotels with available rooms and aggregated data

CREATE OR REPLACE FUNCTION get_available_hotels_with_filters(
  location_filter VARCHAR DEFAULT NULL,
  budget_max DECIMAL DEFAULT NULL,
  guest_count INT DEFAULT NULL,
  limit_count INT DEFAULT 30
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
  available_room_types TEXT,
  all_facilities TEXT,
  avg_rating NUMERIC,
  total_rating BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_rooms AS (
    SELECT
      lk.id_list_hotel,
      lk.id_list_kamar,
      lk.id_detail_kamar,
      lk.price,
      lk.status,
      dk.capacity,
      dk.type_room,
      dk.facility
    FROM list_kamar lk
    JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
    WHERE lk.status = 'available'
      AND (budget_max IS NULL OR lk.price <= budget_max)
      AND (guest_count IS NULL OR dk.capacity >= guest_count)
  ),
  hotel_data AS (
    SELECT
      lh.id_list_hotel,
      lh.hotel_name,
      lh.location,
      lh.contact_person,
      lh.contact_email,
      lh.contact_phone,
      COUNT(fr.id_list_kamar)::BIGINT as available_room_count,
      MIN(fr.price)::DECIMAL as min_price,
      MAX(fr.price)::DECIMAL as max_price,
      MAX(fr.capacity)::INT as max_capacity,
      STRING_AGG(DISTINCT fr.type_room, ', ' ORDER BY fr.type_room)::TEXT as available_room_types,
      STRING_AGG(DISTINCT fr.facility, ', ')::TEXT as all_facilities
    FROM list_hotel lh
    LEFT JOIN filtered_rooms fr ON lh.id_list_hotel = fr.id_list_hotel
    WHERE (location_filter IS NULL OR lh.location ILIKE '%' || location_filter || '%')
    GROUP BY
      lh.id_list_hotel,
      lh.hotel_name,
      lh.location,
      lh.contact_person,
      lh.contact_email,
      lh.contact_phone
    HAVING COUNT(fr.id_list_kamar) > 0
  )
  SELECT
    hd.id_list_hotel,
    hd.hotel_name,
    hd.location,
    hd.contact_person,
    hd.contact_email,
    hd.contact_phone,
    hd.available_room_count,
    hd.min_price,
    hd.max_price,
    hd.max_capacity,
    hd.available_room_types,
    hd.all_facilities,
    COALESCE(AVG(hr.rating)::NUMERIC, 0) as avg_rating,
    COALESCE(COUNT(hr.id_rating)::BIGINT, 0) as total_rating
  FROM hotel_data hd
  LEFT JOIN hotel_rating hr ON hd.id_list_hotel = hr.id_list_hotel
  GROUP BY
    hd.id_list_hotel,
    hd.hotel_name,
    hd.location,
    hd.contact_person,
    hd.contact_email,
    hd.contact_phone,
    hd.available_room_count,
    hd.min_price,
    hd.max_price,
    hd.max_capacity,
    hd.available_room_types,
    hd.all_facilities
  ORDER BY hd.min_price ASC, hd.available_room_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
