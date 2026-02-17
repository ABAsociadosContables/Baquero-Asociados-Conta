/* ============================================
   Contact Form — contact.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('contactNombre').value.trim();
        const correo = document.getElementById('contactCorreo').value.trim();
        const telefono = document.getElementById('contactTelefono').value.trim();
        const tipo = document.getElementById('contactTipo').value;
        const mensaje = document.getElementById('contactMensaje').value.trim();

        if (!nombre || !correo || !mensaje) {
            alert('Por favor completa los campos obligatorios.');
            return;
        }

        // Build WhatsApp message
        const waMessage = encodeURIComponent(
            `Hola, soy ${nombre}.%0A` +
            `Correo: ${correo}%0A` +
            `Teléfono: ${telefono}%0A` +
            `Tipo de consulta: ${tipo}%0A` +
            `Mensaje: ${mensaje}`
        );

        // Save to localStorage for admin
        const contacts = JSON.parse(localStorage.getItem('baquero_contacts') || '[]');
        contacts.push({
            id: Date.now(),
            nombre,
            correo,
            telefono,
            tipo,
            mensaje,
            estado: 'Nuevo',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('baquero_contacts', JSON.stringify(contacts));

        // Show success modal
        showModal(
            '📨',
            '¡Mensaje Enviado!',
            'Gracias por contactarnos. Serás redirigido a WhatsApp para confirmar tu mensaje.'
        );

        // Redirect to WhatsApp after 2s
        setTimeout(() => {
            window.open(`https://wa.me/573222120235?text=${waMessage}`, '_blank');
        }, 2000);

        form.reset();
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
