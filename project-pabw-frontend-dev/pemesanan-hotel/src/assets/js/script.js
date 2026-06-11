// Fungsi bantuan untuk format mata uang Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Variabel global
let currentRoom = {
    name: '',
    price: 0,
    capacity: 0
};

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistem Pemesanan Hotel PABW Dimulai');
    setMinDates();
    setupEventListeners();
});

// Atur tanggal minimum untuk input tanggal
function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const quickCheckin = document.getElementById('quick-checkin');
    if (quickCheckin) quickCheckin.min = today;

    const quickCheckout = document.getElementById('quick-checkout');
    if (quickCheckout) quickCheckout.min = tomorrowStr;

    const checkin = document.getElementById('checkin');
    if (checkin) checkin.min = today;

    const checkout = document.getElementById('checkout');
    if (checkout) checkout.min = tomorrowStr;
}

// Siapkan event listener
function setupEventListeners() {
    const checkin = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');

    if (checkin) {
        checkin.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            const minCheckout = new Date(checkinDate);
            minCheckout.setDate(minCheckout.getDate() + 1);
            checkout.min = minCheckout.toISOString().split('T')[0];
            if (checkout.value && new Date(checkout.value) <= checkinDate) {
                checkout.value = checkout.min;
            }
            calculateTotal();
        });
    }

    if (checkout) {
        checkout.addEventListener('change', calculateTotal);
    }

    const discountSelect = document.getElementById('discount');
    if (discountSelect) {
        discountSelect.addEventListener('change', calculateTotal);
    }

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

// Toggle menu mobile
function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
    document.querySelector('.mobile-menu-toggle').classList.toggle('active');
}

// Tutup menu mobile
function closeMobileMenu() {
    document.getElementById('navMenu').classList.remove('active');
    document.querySelector('.mobile-menu-toggle').classList.remove('active');
}

// Gulir ke bagian kamar
function scrollToRooms() {
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
}

// Filter kamar berdasarkan kriteria pemesanan cepat
function filterRooms() {
    const checkin = document.getElementById('quick-checkin').value;
    const checkout = document.getElementById('quick-checkout').value;
    const guests = parseInt(document.getElementById('quick-guests').value);

    if (!checkin || !checkout) {
        alert('Silakan pilih tanggal check-in dan check-out.');
        return;
    }

    if (new Date(checkout) <= new Date(checkin)) {
        alert('Tanggal check-out harus setelah tanggal check-in.');
        return;
    }

    const roomCards = document.querySelectorAll('.room-card');
    let visibleCount = 0;

    roomCards.forEach(card => {
        const capacity = parseInt(card.dataset.capacity);
        if (capacity >= guests) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    scrollToRooms();

    if (visibleCount === 0) {
        alert('Tidak ada kamar yang tersedia untuk jumlah tamu yang dipilih. Silakan sesuaikan pencarian Anda.');
    }
}

// Buka modal pemesanan
function openBookingModal(roomName, roomPrice, roomCapacity) {
    currentRoom = { name: roomName, price: roomPrice, capacity: roomCapacity };

    const modal = document.getElementById('bookingModal');
    const modalRoomInfo = document.getElementById('modalRoomInfo');

    modalRoomInfo.innerHTML = `
        <h3>${roomName}</h3>
        <p><strong>Harga:</strong> ${formatCurrency(roomPrice)} per malam &nbsp;|&nbsp; <strong>Kapasitas:</strong> ${roomCapacity} tamu</p>
    `;

    const guestsSelect = document.getElementById('guests');
    guestsSelect.innerHTML = '';
    for (let i = 1; i <= roomCapacity; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i === 1 ? '1 Tamu' : `${i} Tamu`;
        if (i === 2 && roomCapacity >= 2) option.selected = true;
        guestsSelect.appendChild(option);
    }

    document.getElementById('bookingForm').reset();
    setMinDates();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    calculateTotal();
}

// Tutup modal pemesanan
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Hitung total harga
function calculateTotal() {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const discountSelect = document.getElementById('discount');

    if (!checkin || !checkout) {
        updatePriceSummary(0, 0, 0, 0, 0);
        return;
    }

    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        updatePriceSummary(0, 0, 0, 0, 0);
        return;
    }

    const roomRate = currentRoom.price;
    const subtotal = roomRate * nights;
    let discountPercent = 0;
    const discountType = discountSelect.value;

    if (discountType === 'early') discountPercent = 15;
    else if (discountType === 'seasonal') discountPercent = 20;
    else if (discountType === 'loyalty') discountPercent = 10;

    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    updatePriceSummary(roomRate, nights, subtotal, discountAmount, total);
}

// Perbarui ringkasan harga
function updatePriceSummary(roomRate, nights, subtotal, discountAmount, total) {
    document.getElementById('roomRate').textContent = formatCurrency(roomRate);
    document.getElementById('numNights').textContent = nights;
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('discountAmount').textContent = discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : formatCurrency(0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

// Tangani pengiriman formulir pemesanan
function handleBookingSubmit(event) {
    event.preventDefault();

    const { value: checkin } = document.getElementById('checkin');
    const { value: checkout } = document.getElementById('checkout');
    const { value: guests } = document.getElementById('guests');
    const { value: fullname } = document.getElementById('fullname');
    const { value: email } = document.getElementById('email');
    const { value: phone } = document.getElementById('phone');
    const { value: country } = document.getElementById('country');
    const { value: requests } = document.getElementById('requests');
    const { value: discount } = document.getElementById('discount');

    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        alert('Silakan pilih tanggal check-in dan check-out yang valid.');
        return;
    }

    if (parseInt(guests) > currentRoom.capacity) {
        alert(`Kamar ini dapat menampung maksimal ${currentRoom.capacity} tamu.`);
        return;
    }

    const roomRate = currentRoom.price;
    const subtotal = roomRate * nights;
    let discountPercent = 0;
    let discountName = 'Tidak ada';

    switch(discount) {
        case 'early':
            discountPercent = 15;
            discountName = 'Pemesanan Awal (Diskon 15%)';
            break;
        case 'seasonal':
            discountPercent = 20;
            discountName = 'Musiman (Diskon 20%)';
            break;
        case 'loyalty':
            discountPercent = 10;
            discountName = 'Loyalitas (Diskon 10%)';
            break;
    }

    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    const booking = {
        room: currentRoom.name, checkin, checkout, nights, guests, fullname, email, phone, country, requests,
        discount: discountName, roomRate, subtotal, discountAmount, total,
        bookingDate: new Date().toISOString()
    };

    saveBooking(booking);
    closeBookingModal();
    showConfirmation(booking);
}

// Simpan pemesanan ke localStorage
function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('pabwBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('pabwBookings', JSON.stringify(bookings));
}

// Tampilkan modal konfirmasi
function showConfirmation(booking) {
    const modal = document.getElementById('confirmationModal');
    const confirmationDetails = document.getElementById('confirmationDetails');
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const checkinDate = new Date(booking.checkin).toLocaleDateString('id-ID', dateOptions);
    const checkoutDate = new Date(booking.checkout).toLocaleDateString('id-ID', dateOptions);

    confirmationDetails.innerHTML = `
        <div style="text-align: left; margin: 1rem 0;">
            <p><strong>Referensi Pemesanan:</strong> PABW${Date.now().toString().slice(-8)}</p>
            <p><strong>Nama Tamu:</strong> ${booking.fullname}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Telepon:</strong> ${booking.phone}</p>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #cdd8e6;">
            <p><strong>Tipe Kamar:</strong> ${booking.room}</p>
            <p><strong>Check-In:</strong> ${checkinDate}</p>
            <p><strong>Check-Out:</strong> ${checkoutDate}</p>
            <p><strong>Jumlah Malam:</strong> ${booking.nights}</p>
            <p><strong>Jumlah Tamu:</strong> ${booking.guests}</p>
            ${booking.requests ? `<p><strong>Permintaan Khusus:</strong> ${booking.requests}</p>` : ''}
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #cdd8e6;">
            <p><strong>Tarif Kamar:</strong> ${formatCurrency(booking.roomRate)}/malam</p>
            <p><strong>Subtotal:</strong> ${formatCurrency(booking.subtotal)}</p>
            ${booking.discountAmount > 0 ? `<p style="color: #27ae60;"><strong>Diskon (${booking.discount}):</strong> -${formatCurrency(booking.discountAmount)}</p>` : ''}
            <p style="font-size: 1.2rem; color: #0b2545;"><strong>Jumlah Total:</strong> ${formatCurrency(booking.total)}</p>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Tutup modal konfirmasi
function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Tutup modal saat mengklik di luar
window.onclick = function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const confirmationModal = document.getElementById('confirmationModal');
    if (event.target === bookingModal) closeBookingModal();
    if (event.target === confirmationModal) closeConfirmationModal();
}

// Tutup modal dengan tombol Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeBookingModal();
        closeConfirmationModal();
        closeMobileMenu();
    }
});
