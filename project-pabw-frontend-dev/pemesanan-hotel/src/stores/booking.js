import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGet } from '@/services/api'

export const useBookingStore = defineStore('booking', () => {
  const currentRoom = ref({ name: '', price: 0, capacity: 0, hotelId: null, hotelName: '' })
  const bookings = ref(JSON.parse(localStorage.getItem('pabwBookings') || '[]'))
  const showBookingModal = ref(false)
  const showConfirmationModal = ref(false)
  const lastBooking = ref(null)

  function setRoom(room) {
    currentRoom.value = room
    showBookingModal.value = true
  }

  function closeBookingModal() {
    showBookingModal.value = false
  }

  function saveBooking(booking) {
    bookings.value.push(booking)
    localStorage.setItem('pabwBookings', JSON.stringify(bookings.value))
    lastBooking.value = booking
    showBookingModal.value = false
    showConfirmationModal.value = true
  }

  function closeConfirmationModal() {
    showConfirmationModal.value = false
    lastBooking.value = null
  }

  function getBookingsByUser(userId) {
    return bookings.value.filter(b => b.userId === userId)
  }

  function getLatestBookingForHotel(hotelId) {
    const normalizedHotelId = parseInt(hotelId)
    const hotelBookings = bookings.value.filter(b => parseInt(b.hotelId) === normalizedHotelId)
    return hotelBookings.length > 0 ? hotelBookings[hotelBookings.length - 1] : null
  }

  async function syncBookingsFromBackend(userId) {
    if (!userId) return []

    const response = await apiGet(`/customer/${userId}/history?limit=50&offset=0`)
    const backendBookings = Array.isArray(response?.data) ? response.data : []

    const normalized = backendBookings.map((booking) => ({
      id_history: booking.id_history,
      userId,
      hotelId: booking.id_list_hotel,
      hotelName: booking.hotel_name,
      room: booking.roomType || booking.type_room || booking.room_number,
      roomNumber: booking.room_number,
      checkin: booking.checkin_time,
      checkout: booking.checkout_time,
      nights: Math.max(1, Math.ceil((new Date(booking.checkout_time) - new Date(booking.checkin_time)) / 86400000)),
      guests: booking.capacity || 1,
      total: booking.amount,
      amount: booking.amount,
      status: booking.status,
      bookingDate: booking.purchase_date
    }))

    const localBookings = bookings.value.filter(item => item.userId !== userId)
    bookings.value = [...localBookings, ...normalized]
    localStorage.setItem('pabwBookings', JSON.stringify(bookings.value))
    return normalized
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

  return {
    currentRoom, bookings, showBookingModal, showConfirmationModal, lastBooking,
    setRoom, closeBookingModal, saveBooking, closeConfirmationModal,
    getBookingsByUser, getLatestBookingForHotel, syncBookingsFromBackend, formatCurrency
  }
})