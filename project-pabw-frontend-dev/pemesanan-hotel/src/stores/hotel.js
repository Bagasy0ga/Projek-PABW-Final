import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGet } from '@/services/api'

const HOTEL_FALLBACK_IMAGES = [
  '/images/hotel-1.jpg',
  '/images/hotel-2.jpg',
  '/images/hotel-3.jpg',
  '/images/hotel-4.jpg'
]

const ROOM_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop'
]

function parseCity(location = '') {
  const parts = String(location || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  return parts.at(-1) || 'Indonesia'
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeStatus(status = '') {
  return String(status || '').toLowerCase().trim()
}

function splitTextList(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => String(item || '').trim())
      .filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  return value
    .split(/[,;\n]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function roundRating(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return 0
  }

  return Math.round(number * 10) / 10
}

function getFallbackHotelImage(index = 0) {
  return HOTEL_FALLBACK_IMAGES[index % HOTEL_FALLBACK_IMAGES.length]
}

function getFallbackRoomImage(index = 0) {
  return ROOM_FALLBACK_IMAGES[index % ROOM_FALLBACK_IMAGES.length]
}

function parseIdList(value) {
  if (!value) {
    return []
  }

  return String(value)
    .split(',')
    .map(item => parseInt(item))
    .filter(item => Number.isInteger(item))
}

function mapRoom(row, index, hotelId, hotelName) {
  const status = normalizeStatus(row.status)

  const rawAvailableCount = row.available_count
  const rawTotalRooms = row.total_rooms
  const rawUnavailableCount = row.unavailable_count

  const availableCount =
    rawAvailableCount !== undefined && rawAvailableCount !== null
      ? toNumber(rawAvailableCount)
      : status === 'available'
        ? 1
        : 0

  const totalRooms =
    rawTotalRooms !== undefined && rawTotalRooms !== null
      ? toNumber(rawTotalRooms)
      : 1

  const unavailableCount =
    rawUnavailableCount !== undefined && rawUnavailableCount !== null
      ? toNumber(rawUnavailableCount)
      : Math.max(totalRooms - availableCount, 0)

  const availableRoomIds = parseIdList(row.available_room_ids)

  if (availableRoomIds.length === 0 && row.id_list_kamar && availableCount > 0) {
    availableRoomIds.push(parseInt(row.id_list_kamar))
  }

  const detailRoomId = row.id_detail_kamar || row.id_list_kamar || index + 1

  return {
    id: `${hotelId}-${detailRoomId}`,
    id_list_kamar: row.id_list_kamar || availableRoomIds[0] || null,
    id_detail_kamar: row.id_detail_kamar || null,

    name: row.type_room || row.name || 'Tipe kamar belum diisi',
    price: toNumber(row.price),
    capacity: toNumber(row.capacity),

    image: row.room_image || row.image || getFallbackRoomImage(index),
    description: row.description || '',
    facilities: splitTextList(row.facility),

    availableCount,
    totalRooms,
    unavailableCount,
    availableRoomIds,

    badge: null,
    badgeClass: '',
    featured: index === 0,
    status: availableCount > 0 ? 'available' : 'unavailable',

    hotelId,
    hotelName
  }
}

function mapHotel(row, rooms = [], ratingSummary = null, index = 0) {
  const hotelId = row.id_list_hotel
  const hotelName = row.hotel_name || 'Nama hotel belum diisi'
  const address = row.location || ''

  const availableRooms = rooms.filter(room => room.status === 'available')

  const availablePrices = availableRooms
    .map(room => toNumber(room.price))
    .filter(price => price > 0)

  const databasePrice = toNumber(row.priceFrom || row.min_price || row.price_from)

  const priceFrom =
    availablePrices.length > 0
      ? Math.min(...availablePrices)
      : databasePrice

  const averageRating = ratingSummary
    ? ratingSummary.rata_rata_rating
    : row.rata_rata_rating

  const reviewCount = ratingSummary
    ? ratingSummary.total_rating
    : row.total_rating

  const totalAvailableRooms = rooms.reduce((total, room) => {
    return total + toNumber(room.availableCount)
  }, 0)

  const totalPhysicalRooms = rooms.reduce((total, room) => {
    return total + toNumber(room.totalRooms)
  }, 0)

  return {
    id: hotelId,
    companyId: row.id_company_profile,

    name: hotelName,
    city: parseCity(address),
    address,

    description: row.description || '',
    policy: row.policy || '',

    image: row.image || row.hotel_image || getFallbackHotelImage(index),

    rating: roundRating(averageRating),
    reviewCount: toNumber(reviewCount),

    priceFrom,
    stars: toNumber(row.stars || row.hotel_stars || row.kelas_bintang),

    facilities: splitTextList(row.facility),

    rooms,
    totalAvailableRooms,
    totalPhysicalRooms,

    contactPerson: row.contact_person || '',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || ''
  }
}

export const useHotelStore = defineStore('hotel', () => {
  const hotels = ref([])
  const ratings = ref([])
  const loadedHotelIds = ref(new Set())
  const loadedAllHotels = ref(false)

  async function getHotelDescriptionFromDatabase(hotelId, fallbackRow = {}) {
    try {
      const response = await apiGet(`/hotel/descriptions/${hotelId}`)

      if (response?.data) {
        return {
          ...fallbackRow,
          ...response.data
        }
      }
    } catch (error) {
      console.error('Gagal mengambil deskripsi hotel:', error)
    }

    try {
      const response = await apiGet(`/hotel/${hotelId}`)

      if (response?.data) {
        return {
          ...fallbackRow,
          ...response.data
        }
      }
    } catch (error) {
      console.error('Gagal mengambil detail hotel:', error)
    }

    return fallbackRow
  }

  async function getHotelRoomsFromDatabase(hotelId, hotelName = '') {
    try {
      const response = await apiGet(`/rooms/available?id_list_hotel=${hotelId}&limit=1000&offset=0`)
      const rows = Array.isArray(response?.data) ? response.data : []

      return rows.map((room, index) => {
        return mapRoom(room, index, hotelId, hotelName || room.hotel_name || '')
      })
    } catch (error) {
      console.error('Gagal mengambil data kamar hotel:', error)
      return []
    }
  }

  async function getHotelRatingFromDatabase(hotelId) {
    try {
      const response = await apiGet(`/hotels/${hotelId}/ratings?limit=20&offset=0`)
      const summary = response?.data?.summary || null
      const ratingRows = Array.isArray(response?.data?.ratings) ? response.data.ratings : []

      ratings.value = ratings.value.filter(item => item.id_list_hotel !== hotelId)

      ratings.value.push(...ratingRows.map(item => ({
        ...item,
        id_list_hotel: hotelId
      })))

      return summary
    } catch (error) {
      console.error('Gagal mengambil rating hotel:', error)

      return {
        total_rating: 0,
        rata_rata_rating: 0
      }
    }
  }

  async function buildHotelFromDatabase(row, index = 0) {
    const hotelId = row.id_list_hotel

    const hotelDetail = await getHotelDescriptionFromDatabase(hotelId, row)

    const rooms = await getHotelRoomsFromDatabase(
      hotelId,
      hotelDetail.hotel_name || row.hotel_name
    )

    const ratingSummary = await getHotelRatingFromDatabase(hotelId)

    return mapHotel(hotelDetail, rooms, ratingSummary, index)
  }

  async function loadHotels(force = false) {
    if (loadedAllHotels.value && hotels.value.length > 0 && !force) {
      return hotels.value
    }

    try {
      const response = await apiGet('/hotel/all')
      const rows = Array.isArray(response?.data) ? response.data : []

      const hotelRows = await Promise.all(
        rows.map((row, index) => buildHotelFromDatabase(row, index))
      )

      hotels.value = hotelRows

      loadedHotelIds.value = new Set(
        hotelRows
          .map(hotel => hotel.id)
          .filter(Boolean)
      )

      loadedAllHotels.value = true

      return hotels.value
    } catch (error) {
      console.error('Gagal mengambil daftar hotel:', error)

      hotels.value = []
      loadedHotelIds.value = new Set()
      loadedAllHotels.value = false

      return hotels.value
    }
  }

  async function loadHotelById(id, force = false) {
    const hotelId = parseInt(id)

    if (!hotelId) {
      return null
    }

    if (loadedHotelIds.value.has(hotelId) && !force) {
      return hotels.value.find(hotel => hotel.id === hotelId) || null
    }

    const existingIndex = hotels.value.findIndex(item => item.id === hotelId)
    const fallbackIndex = existingIndex >= 0 ? existingIndex : Math.max(hotelId - 1, 0)

    const existingHotel = hotels.value.find(item => item.id === hotelId) || {}
    const hotelRow = await getHotelDescriptionFromDatabase(hotelId, existingHotel)

    if (!hotelRow || !hotelRow.id_list_hotel) {
      return null
    }

    const rooms = await getHotelRoomsFromDatabase(hotelId, hotelRow.hotel_name)
    const ratingSummary = await getHotelRatingFromDatabase(hotelId)
    const hotel = mapHotel(hotelRow, rooms, ratingSummary, fallbackIndex)

    if (existingIndex >= 0) {
      hotels.value.splice(existingIndex, 1, hotel)
    } else {
      hotels.value.push(hotel)
    }

    loadedHotelIds.value.add(hotelId)

    return hotel
  }

  function getHotelById(id) {
    return hotels.value.find(hotel => hotel.id === parseInt(id))
  }

  async function addRating(hotelId) {
    await loadHotelById(hotelId, true)
  }

  function getRatingByUser() {
    return null
  }

  return {
    hotels,
    ratings,
    loadHotels,
    loadHotelById,
    getHotelById,
    addRating,
    getRatingByUser
  }
})