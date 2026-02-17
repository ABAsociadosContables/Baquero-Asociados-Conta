/* ============================================
   Agenda tu Asesoría — agenda.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    initAgendaForm();
});

/* ---------- Calendar ---------- */
let currentMonth, currentYear, selectedDate = null, selectedTime = null;

function initCalendar() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('calendarMonth');
    if (!grid || !monthLabel) return;

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    let html = dayNames.map(d => `<div class="calendar-day-name">${d}</div>`).join('');

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month disabled">${daysInPrevMonth - i}</div>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.getTime() === today.getTime();
        const isPast = date < today;
        const isSunday = date.getDay() === 0;
        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isPast || isSunday) classes += ' disabled';
        if (isSelected) classes += ' selected';

        const clickable = !isPast && !isSunday;
        html += `<div class="${classes}" ${clickable ? `onclick="selectDate(${currentYear},${currentMonth},${day})"` : ''}>${day}</div>`;
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="calendar-day other-month disabled">${i}</div>`;
        }
    }

    grid.innerHTML = html;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
    showTimeSlots();

    // Update hidden input
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        const formatted = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
        dateInput.value = formatted;
    }
}

function showTimeSlots() {
    const container = document.getElementById('timeSlotsContainer');
    if (!container) return;

    const slots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    let html = '<h4 style="margin-bottom: 12px; color: var(--azul-oscuro);">Selecciona una hora</h4>';
    html += '<div class="time-slots">';
    slots.forEach(time => {
        const isSelected = selectedTime === time;
        html += `<div class="time-slot${isSelected ? ' selected' : ''}" onclick="selectTime('${time}')">${time}</div>`;
    });
    html += '</div>';

    container.innerHTML = html;
    container.style.display = 'block';
}

function selectTime(time) {
    selectedTime = time;
    showTimeSlots();

    const timeInput = document.getElementById('selectedTime');
    if (timeInput) {
        timeInput.value = time;
    }
}

/* ---------- Agenda Form ---------- */
function initAgendaForm() {
    const form = document.getElementById('agendaForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('agendaNombre').value.trim();
        const correo = document.getElementById('agendaCorreo').value.trim();
        const telefono = document.getElementById('agendaTelefono').value.trim();
        const tipo = document.getElementById('agendaTipo').value;
        const modalidad = document.getElementById('agendaModalidad').value;
        const fecha = document.getElementById('selectedDate').value;
        const hora = document.getElementById('selectedTime').value;
        const mensaje = document.getElementById('agendaMensaje').value.trim();

        if (!nombre || !correo || !telefono || !tipo || !modalidad || !fecha || !hora) {
            alert('Por favor completa todos los campos obligatorios y selecciona fecha y hora.');
            return;
        }

        // Save to localStorage
        const appointments = JSON.parse(localStorage.getItem('baquero_appointments') || '[]');
        const newAppointment = {
            id: Date.now(),
            nombre,
            correo,
            telefono,
            tipo,
            modalidad,
            fecha,
            hora,
            mensaje,
            estado: 'Pendiente',
            createdAt: new Date().toISOString()
        };
        appointments.push(newAppointment);
        localStorage.setItem('baquero_appointments', JSON.stringify(appointments));

        // Show success modal
        showModal(
            '✅',
            '¡Asesoría Agendada!',
            `Tu asesoría de <strong>${tipo}</strong> ha sido agendada para el <strong>${fecha}</strong> a las <strong>${hora}</strong> (${modalidad}). Te enviaremos una confirmación a <strong>${correo}</strong>.`
        );

        form.reset();
        selectedDate = null;
        selectedTime = null;
        const container = document.getElementById('timeSlotsContainer');
        if (container) container.style.display = 'none';
        renderCalendar();
    });
}

/* ---------- Modal ---------- */
function showModal(icon, title, message) {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;

    overlay.querySelector('.modal-icon').textContent = icon;
    overlay.querySelector('h3').textContent = title;
    overlay.querySelector('.modal-message').innerHTML = message;
    overlay.classList.add('active');
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
}
