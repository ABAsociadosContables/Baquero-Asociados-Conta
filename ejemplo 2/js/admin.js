/* ============================================
   Admin Panel — admin.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initAdminLogin();
    initAdminNav();
    initAdminSections();
});

/* ---------- Login ---------- */
function initAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUser').value.trim();
        const pass = document.getElementById('adminPass').value.trim();

        // Simple local credentials (in production, use back-end auth)
        if (user === 'admin' && pass === 'Baquero2024') {
            document.querySelector('.admin-login').style.display = 'none';
            document.querySelector('.admin-panel').classList.add('active');
            localStorage.setItem('baquero_admin_logged', 'true');
            loadDashboard();
        } else {
            const error = document.getElementById('loginError');
            if (error) {
                error.textContent = 'Usuario o contraseña incorrectos';
                error.style.display = 'block';
            }
        }
    });

    // Check if already logged in
    if (localStorage.getItem('baquero_admin_logged') === 'true') {
        const loginBox = document.querySelector('.admin-login');
        const panel = document.querySelector('.admin-panel');
        if (loginBox && panel) {
            loginBox.style.display = 'none';
            panel.classList.add('active');
            loadDashboard();
        }
    }
}

function adminLogout() {
    localStorage.removeItem('baquero_admin_logged');
    location.reload();
}

/* ---------- Navigation ---------- */
function initAdminNav() {
    const navLinks = document.querySelectorAll('.admin-sidebar nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section === 'logout') {
                adminLogout();
                return;
            }
            showSection(section);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    // Load section data
    if (sectionId === 'section-agenda') loadAppointments();
    if (sectionId === 'section-contacts') loadContacts();
    if (sectionId === 'section-news') loadNews();
    if (sectionId === 'section-calendar') loadTaxCalendar();
    if (sectionId === 'section-dashboard') loadDashboard();
}

/* ---------- Dashboard ---------- */
function loadDashboard() {
    const appointments = JSON.parse(localStorage.getItem('baquero_appointments') || '[]');
    const contacts = JSON.parse(localStorage.getItem('baquero_contacts') || '[]');
    const news = JSON.parse(localStorage.getItem('baquero_news') || '[]');

    const el = (id) => document.getElementById(id);

    if (el('statAppointments')) el('statAppointments').textContent = appointments.length;
    if (el('statContacts')) el('statContacts').textContent = contacts.length;
    if (el('statNews')) el('statNews').textContent = news.length;
    if (el('statPending')) {
        el('statPending').textContent = appointments.filter(a => a.estado === 'Pendiente').length;
    }

    // Recent activity
    const activityContainer = el('recentActivity');
    if (activityContainer) {
        const allItems = [
            ...appointments.map(a => ({ ...a, itemType: 'Cita' })),
            ...contacts.map(c => ({ ...c, itemType: 'Contacto' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        if (allItems.length === 0) {
            activityContainer.innerHTML = '<p style="color:var(--gris);text-align:center;padding:20px;">No hay actividad reciente</p>';
        } else {
            let html = '<table class="admin-table"><thead><tr><th>Tipo</th><th>Nombre</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>';
            allItems.forEach(item => {
                const date = new Date(item.createdAt).toLocaleDateString('es-CO');
                const badgeClass = item.estado === 'Pendiente' ? 'badge-warning' : item.estado === 'Nuevo' ? 'badge-info' : 'badge-success';
                html += `<tr>
          <td>${item.itemType}</td>
          <td>${item.nombre}</td>
          <td>${date}</td>
          <td><span class="badge ${badgeClass}">${item.estado}</span></td>
        </tr>`;
            });
            html += '</tbody></table>';
            activityContainer.innerHTML = html;
        }
    }
}

/* ---------- Appointments ---------- */
function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('baquero_appointments') || '[]');
    const container = document.getElementById('appointmentsList');
    if (!container) return;

    if (appointments.length === 0) {
        container.innerHTML = '<p style="color:var(--gris);text-align:center;padding:20px;">No hay citas registradas</p>';
        return;
    }

    let html = '<table class="admin-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th><th>Hora</th><th>Modalidad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    appointments.forEach((a, i) => {
        const badgeClass = a.estado === 'Pendiente' ? 'badge-warning' : a.estado === 'Confirmada' ? 'badge-success' : 'badge-info';
        html += `<tr>
      <td>${a.nombre}<br><small style="color:var(--gris)">${a.correo}</small></td>
      <td>${a.tipo}</td>
      <td>${a.fecha}</td>
      <td>${a.hora}</td>
      <td>${a.modalidad}</td>
      <td><span class="badge ${badgeClass}">${a.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="updateAppointmentStatus(${i},'Confirmada')" style="margin:2px;padding:6px 12px;font-size:0.75rem;">Confirmar</button>
        <button class="btn btn-sm" onclick="deleteAppointment(${i})" style="margin:2px;padding:6px 12px;font-size:0.75rem;background:var(--rojo);color:white;">Eliminar</button>
      </td>
    </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function updateAppointmentStatus(index, status) {
    const appointments = JSON.parse(localStorage.getItem('baquero_appointments') || '[]');
    if (appointments[index]) {
        appointments[index].estado = status;
        localStorage.setItem('baquero_appointments', JSON.stringify(appointments));
        loadAppointments();
    }
}

function deleteAppointment(index) {
    if (!confirm('¿Eliminar esta cita?')) return;
    const appointments = JSON.parse(localStorage.getItem('baquero_appointments') || '[]');
    appointments.splice(index, 1);
    localStorage.setItem('baquero_appointments', JSON.stringify(appointments));
    loadAppointments();
}

/* ---------- Contacts ---------- */
function loadContacts() {
    const contacts = JSON.parse(localStorage.getItem('baquero_contacts') || '[]');
    const container = document.getElementById('contactsList');
    if (!container) return;

    if (contacts.length === 0) {
        container.innerHTML = '<p style="color:var(--gris);text-align:center;padding:20px;">No hay mensajes recibidos</p>';
        return;
    }

    let html = '<table class="admin-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Mensaje</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>';
    contacts.forEach((c, i) => {
        const date = new Date(c.createdAt).toLocaleDateString('es-CO');
        html += `<tr>
      <td>${c.nombre}<br><small style="color:var(--gris)">${c.correo} | ${c.telefono}</small></td>
      <td>${c.tipo}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.mensaje}</td>
      <td>${date}</td>
      <td>
        <button class="btn btn-sm" onclick="deleteContact(${i})" style="padding:6px 12px;font-size:0.75rem;background:var(--rojo);color:white;">Eliminar</button>
      </td>
    </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteContact(index) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    const contacts = JSON.parse(localStorage.getItem('baquero_contacts') || '[]');
    contacts.splice(index, 1);
    localStorage.setItem('baquero_contacts', JSON.stringify(contacts));
    loadContacts();
}

/* ---------- News ---------- */
function initAdminSections() {
    // News form
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('newsTitle').value.trim();
            const content = document.getElementById('newsContent').value.trim();
            const category = document.getElementById('newsCategory').value;

            if (!title || !content) return;

            const news = JSON.parse(localStorage.getItem('baquero_news') || '[]');
            news.unshift({
                id: Date.now(),
                title,
                content,
                category,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('baquero_news', JSON.stringify(news));
            newsForm.reset();
            loadNews();
        });
    }

    // Tax Calendar form
    const calForm = document.getElementById('taxCalendarForm');
    if (calForm) {
        calForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('taxTitle').value.trim();
            const date = document.getElementById('taxDate').value;
            const description = document.getElementById('taxDescription').value.trim();

            if (!title || !date) return;

            const events = JSON.parse(localStorage.getItem('baquero_tax_calendar') || '[]');
            events.push({
                id: Date.now(),
                title,
                date,
                description,
                createdAt: new Date().toISOString()
            });
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
            localStorage.setItem('baquero_tax_calendar', JSON.stringify(events));
            calForm.reset();
            loadTaxCalendar();
        });
    }
}

function loadNews() {
    const news = JSON.parse(localStorage.getItem('baquero_news') || '[]');
    const container = document.getElementById('newsList');
    if (!container) return;

    if (news.length === 0) {
        container.innerHTML = '<p style="color:var(--gris);text-align:center;padding:20px;">No hay noticias publicadas</p>';
        return;
    }

    let html = '';
    news.forEach((n, i) => {
        const date = new Date(n.createdAt).toLocaleDateString('es-CO');
        html += `<div class="admin-card" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:start;">
        <div>
          <span class="badge badge-info">${n.category}</span>
          <h4 style="margin:8px 0 6px;color:var(--azul-oscuro);">${n.title}</h4>
          <p style="font-size:0.9rem;color:var(--gris);">${n.content.substring(0, 150)}${n.content.length > 150 ? '...' : ''}</p>
          <small style="color:var(--gris-claro);">${date}</small>
        </div>
        <button onclick="deleteNews(${i})" style="background:var(--rojo);color:white;border:none;padding:6px 12px;border-radius:8px;font-size:0.75rem;cursor:pointer;">Eliminar</button>
      </div>
    </div>`;
    });
    container.innerHTML = html;
}

function deleteNews(index) {
    if (!confirm('¿Eliminar esta noticia?')) return;
    const news = JSON.parse(localStorage.getItem('baquero_news') || '[]');
    news.splice(index, 1);
    localStorage.setItem('baquero_news', JSON.stringify(news));
    loadNews();
}

/* ---------- Tax Calendar ---------- */
function loadTaxCalendar() {
    const events = JSON.parse(localStorage.getItem('baquero_tax_calendar') || '[]');
    const container = document.getElementById('taxCalendarList');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '<p style="color:var(--gris);text-align:center;padding:20px;">No hay eventos en el calendario tributario</p>';
        return;
    }

    let html = '<table class="admin-table"><thead><tr><th>Fecha</th><th>Evento</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>';
    events.forEach((ev, i) => {
        const date = new Date(ev.date + 'T00:00:00').toLocaleDateString('es-CO');
        const isPast = new Date(ev.date) < new Date();
        html += `<tr style="${isPast ? 'opacity:0.5;' : ''}">
      <td><strong>${date}</strong></td>
      <td>${ev.title}</td>
      <td>${ev.description || '-'}</td>
      <td>
        <button onclick="deleteTaxEvent(${i})" style="background:var(--rojo);color:white;border:none;padding:6px 12px;border-radius:8px;font-size:0.75rem;cursor:pointer;">Eliminar</button>
      </td>
    </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteTaxEvent(index) {
    if (!confirm('¿Eliminar este evento?')) return;
    const events = JSON.parse(localStorage.getItem('baquero_tax_calendar') || '[]');
    events.splice(index, 1);
    localStorage.setItem('baquero_tax_calendar', JSON.stringify(events));
    loadTaxCalendar();
}
