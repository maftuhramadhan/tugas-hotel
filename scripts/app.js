// app.js - Hotel Booking System
// ============================================
// DATA KAMAR HOTEL
// ============================================
const ROOMS_DATA = [
    {
        id: "room-101",
        name: "Single Room",
        pricePerNight: 350000,
        maxGuests: 1,
        description: "Kamar nyaman untuk 1 orang, cocok untuk perjalanan singkat.",
        features: ["Bed 1x", "Free Wi-Fi", "AC", "Shower"],
        images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop"]
    },
    {
        id: "room-102",
        name: "Double Room",
        pricePerNight: 550000,
        maxGuests: 2,
        description: "Kamar luas untuk dua orang dengan pemandangan kota.",
        features: ["Bed 2x", "Free Breakfast", "TV", "Mini Fridge"],
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop"]
    },
    {
        id: "room-201",
        name: "Deluxe Room",
        pricePerNight: 850000,
        maxGuests: 3,
        description: "Deluxe room dengan fasilitas lengkap dan balkon.",
        features: ["Balkon", "King Bed", "Jacuzzi", "Room Service"],
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop"]
    },
    {
        id: "room-301",
        name: "Suite",
        pricePerNight: 1500000,
        maxGuests: 4,
        description: "Suite mewah, cocok untuk keluarga atau acara khusus.",
        features: ["Living Area", "Kitchenette", "Private Check-in", "Butler Service"],
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop"]
    },
    {
        id: "room-523",
        name: "Suite",
        pricePerNight: 1500000,
        maxGuests: 40,
        description: "Suite mewah, cocok untuk keluarga atau acara khusus.",
        features: ["Living Area", "Kitchenette", "Private Check-in", "Butler Service"],
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop"]
    }
];

const STORAGE_KEY = 'hotel_bookings_v1';

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format number to Rupiah currency
function formatRupiah(number) {
    return 'Rp ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Generate unique booking ID
function generateId() {
    return 'booking-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Calculate number of nights between two dates
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get room by ID
function getRoomById(roomId) {
    return ROOMS_DATA.find(room => room.id === roomId);
}

// ============================================
// LOCALSTORAGE FUNCTIONS
// ============================================

// Load all bookings from localStorage
function loadBookings() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading bookings:', error);
        return [];
    }
}

// Save a new booking to localStorage
function saveBooking(booking) {
    try {
        const bookings = loadBookings();
        bookings.push(booking);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        return true;
    } catch (error) {
        console.error('Error saving booking:', error);
        return false;
    }
}

// Delete a booking by ID
function deleteBooking(bookingId) {
    try {
        let bookings = loadBookings();
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        return true;
    } catch (error) {
        console.error('Error deleting booking:', error);
        return false;
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

// Render rooms list (untuk rooms.html)
function renderRooms(rooms = ROOMS_DATA, containerId = 'roomsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (rooms.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-600 col-span-full py-12">Tidak ada kamar yang sesuai dengan filter Anda.</p>';
        return;
    }

    container.innerHTML = rooms.map(room => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <img src="${room.images[0]}" alt="${room.name}" class="w-full h-48 object-cover" loading="lazy">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2 text-gray-800">${room.name}</h3>
                <p class="text-gray-600 mb-4">${room.description}</p>
                <div class="mb-4">
                    <p class="text-sm text-gray-500 mb-2">Fasilitas:</p>
                    <div class="flex flex-wrap gap-2">
                        ${room.features.map(f => `<span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">${f}</span>`).join('')}
                    </div>
                </div>
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <p class="text-2xl font-bold text-purple-600">${formatRupiah(room.pricePerNight)}</p>
                        <p class="text-sm text-gray-500">per malam</p>
                    </div>
                    <p class="text-sm text-gray-600">Maks ${room.maxGuests} tamu</p>
                </div>
                <a href="booking.html?roomId=${room.id}" class="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition">
                    Lihat & Pesan
                </a>
            </div>
        </div>
    `).join('');
}

// Filter rooms based on criteria
function filterRooms() {
    const minPrice = parseInt(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value) || Infinity;
    const guests = parseInt(document.getElementById('filterGuests')?.value) || 0;

    const filtered = ROOMS_DATA.filter(room => {
        const priceMatch = room.pricePerNight >= minPrice && room.pricePerNight <= maxPrice;
        const guestsMatch = guests === 0 || room.maxGuests >= guests;
        return priceMatch && guestsMatch;
    });

    renderRooms(filtered);
}

// ============================================
// BOOKING FORM FUNCTIONS
// ============================================

// Initialize booking form (untuk booking.html)
function initBookingForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    
    if (!roomId) {
        alert('ID kamar tidak valid. Anda akan diarahkan ke halaman kamar.');
        window.location.href = 'rooms.html';
        return;
    }

    const room = getRoomById(roomId);
    if (!room) {
        alert('Kamar tidak ditemukan. Anda akan diarahkan ke halaman kamar.');
        window.location.href = 'rooms.html';
        return;
    }

    // Display room information
    document.getElementById('roomName').textContent = room.name;
    document.getElementById('roomDescription').textContent = room.description;
    document.getElementById('roomPrice').textContent = formatRupiah(room.pricePerNight);
    document.getElementById('roomMaxGuests').textContent = room.maxGuests;
    
    const featuresHtml = room.features.map(f => `
        <span class="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded">${f}</span>
    `).join('');
    document.getElementById('roomFeatures').innerHTML = featuresHtml;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    checkInInput.setAttribute('min', today);
    checkOutInput.setAttribute('min', today);

    // Set maximum guests
    document.getElementById('guests').setAttribute('max', room.maxGuests);

    // Calculate total price when dates change
    function calculateTotal() {
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;

        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (checkOutDate <= checkInDate) {
                document.getElementById('totalPrice').textContent = 'Tanggal tidak valid';
                document.getElementById('totalPrice').classList.add('text-red-600');
                document.getElementById('totalPrice').classList.remove('text-purple-600');
                return;
            }

            const nights = calculateNights(checkIn, checkOut);
            const total = nights * room.pricePerNight;
            document.getElementById('totalPrice').textContent = `${formatRupiah(total)} (${nights} malam)`;
            document.getElementById('totalPrice').classList.remove('text-red-600');
            document.getElementById('totalPrice').classList.add('text-purple-600');
        }
    }

    checkInInput.addEventListener('change', calculateTotal);
    checkOutInput.addEventListener('change', calculateTotal);

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        const guests = parseInt(document.getElementById('guests').value);
        const guestName = document.getElementById('guestName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const notes = document.getElementById('notes').value.trim();

        // Validation
        if (!guestName || !phone || !email || !checkIn || !checkOut || !guests) {
            alert('Mohon lengkapi semua field yang wajib diisi (*)');
            return;
        }

        if (new Date(checkOut) <= new Date(checkIn)) {
            alert('Tanggal check-out harus setelah tanggal check-in');
            checkOutInput.focus();
            return;
        }

        if (guests > room.maxGuests) {
            alert(`Maksimum tamu untuk kamar ini adalah ${room.maxGuests} orang`);
            document.getElementById('guests').focus();
            return;
        }

        if (guests < 1) {
            alert('Jumlah tamu minimal 1 orang');
            document.getElementById('guests').focus();
            return;
        }

        const nights = calculateNights(checkIn, checkOut);
        const total = nights * room.pricePerNight;

        // Show confirmation modal
        showConfirmationModal({
            roomId: room.id,
            roomName: room.name,
            guestName,
            phone,
            email,
            checkIn,
            checkOut,
            guests,
            nights,
            totalPrice: total,
            notes
        });
    });
}

// Show confirmation modal before finalizing booking
function showConfirmationModal(bookingData) {
    const modal = document.getElementById('confirmationModal');
    if (!modal) return;
    
    document.getElementById('confirmRoomName').textContent = bookingData.roomName;
    document.getElementById('confirmGuestName').textContent = bookingData.guestName;
    document.getElementById('confirmDates').textContent = `${bookingData.checkIn} s/d ${bookingData.checkOut}`;
    document.getElementById('confirmGuests').textContent = `${bookingData.guests} orang`;
    document.getElementById('confirmTotal').textContent = formatRupiah(bookingData.totalPrice);

    modal.classList.remove('hidden');

    // Confirm booking button
    const confirmBtn = document.getElementById('confirmBookingBtn');
    confirmBtn.onclick = function() {
        const booking = {
            id: generateId(),
            ...bookingData,
            bookedAt: new Date().toISOString()
        };

        const saved = saveBooking(booking);
        
        if (saved) {
            modal.classList.add('hidden');
            alert('🎉 Pemesanan berhasil!\n\nID Pemesanan: ' + booking.id + '\n\nAnda akan diarahkan ke halaman pemesanan Anda.');
            window.location.href = 'my-bookings.html';
        } else {
            alert('Terjadi kesalahan saat menyimpan pemesanan. Silakan coba lagi.');
        }
    };

    // Cancel button
    const cancelBtn = document.getElementById('cancelBookingBtn');
    cancelBtn.onclick = function() {
        modal.classList.add('hidden');
    };

    // Close modal with ESC key
    function escapeHandler(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.removeEventListener('keydown', escapeHandler);
        }
    }
    document.addEventListener('keydown', escapeHandler);
}

// ============================================
// MY BOOKINGS FUNCTIONS
// ============================================

// Render bookings list (untuk my-bookings.html)
function renderBookings() {
    const container = document.getElementById('bookingsContainer');
    if (!container) return;

    const bookings = loadBookings();

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-gray-600 text-lg mb-4">Anda belum memiliki pemesanan.</p>
                <a href="rooms.html" class="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                    Pesan Kamar Sekarang
                </a>
            </div>
        `;
        return;
    }

    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

    container.innerHTML = bookings.map(booking => {
        const room = getRoomById(booking.roomId);
        const bookingDate = new Date(booking.bookedAt);
        const formattedDate = bookingDate.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${booking.roomName}</h3>
                        <p class="text-sm text-gray-500">Dipesan: ${formattedDate}</p>
                        <p class="text-xs text-gray-400 mt-1">ID: ${booking.id}</p>
                    </div>
                    <span class="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-semibold">Aktif</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">👤 Nama Tamu</p>
                        <p class="font-semibold text-gray-800">${booking.guestName}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">📞 Kontak</p>
                        <p class="font-semibold text-gray-800">${booking.phone}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">📧 Email</p>
                        <p class="font-semibold text-gray-800 break-all">${booking.email}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">👥 Jumlah Tamu</p>
                        <p class="font-semibold text-gray-800">${booking.guests} orang</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">📅 Check-in</p>
                        <p class="font-semibold text-gray-800">${booking.checkIn}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">📅 Check-out</p>
                        <p class="font-semibold text-gray-800">${booking.checkOut}</p>
                    </div>
                </div>

                ${booking.notes ? `
                    <div class="mb-4 bg-blue-50 p-3 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">📝 Catatan</p>
                        <p class="text-gray-800">${booking.notes}</p>
                    </div>
                ` : ''}

                <div class="border-t pt-4 flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">Total Pembayaran</p>
                        <p class="text-2xl font-bold text-purple-600">${formatRupiah(booking.totalPrice)}</p>
                        <p class="text-xs text-gray-500">${booking.nights || calculateNights(booking.checkIn, booking.checkOut)} malam</p>
                    </div>
                    <button onclick="cancelBooking('${booking.id}')" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold">
                        Batalkan Pemesanan
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Cancel/delete a booking
function cancelBooking(bookingId) {
    if (confirm('⚠️ Apakah Anda yakin ingin membatalkan pemesanan ini?\n\nTindakan ini tidak dapat dibatalkan.')) {
        const success = deleteBooking(bookingId);
        if (success) {
            alert('✅ Pemesanan berhasil dibatalkan.');
            renderBookings();
        } else {
            alert('❌ Terjadi kesalahan saat membatalkan pemesanan. Silakan coba lagi.');
        }
    }
}

// Make cancelBooking available globally for onclick handlers
window.cancelBooking = cancelBooking;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Hotel Booking System Initialized');

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking nav links
        const navLinks = mobileMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Page-specific initialization based on current URL
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    
    console.log('Current page:', fileName);

    // Initialize based on page
    if (fileName === 'rooms.html' || fileName === '') {
        console.log('Initializing Rooms page');
        renderRooms();
        
        // Setup filter listeners
        const filterBtn = document.getElementById('filterBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (filterBtn) {
            filterBtn.addEventListener('click', filterRooms);
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                document.getElementById('minPrice').value = '';
                document.getElementById('maxPrice').value = '';
                document.getElementById('filterGuests').value = '0';
                renderRooms();
            });
        }

        // Filter on Enter key
        ['minPrice', 'maxPrice', 'filterGuests'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        filterRooms();
                    }
                });
            }
        });
    } 
    else if (fileName === 'booking.html') {
        console.log('Initializing Booking page');
        initBookingForm();
    } 
    else if (fileName === 'my-bookings.html') {
        console.log('Initializing My Bookings page');
        renderBookings();
    }
    else if (fileName === 'index.html' || fileName === '') {
        console.log('Home page loaded');
        // Add any home page specific initialization here
    }
});

// ============================================
// EXPORT FOR TESTING (Optional)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ROOMS_DATA,
        formatRupiah,
        calculateNights,
        getRoomById,
        loadBookings,
        saveBooking,
        deleteBooking
    };
}

console.log('app.js loaded successfully!');