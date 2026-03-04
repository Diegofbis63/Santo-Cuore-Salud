// Test completo del nuevo sistema programático de reservas
// Sin IA, sin tokens, conectado a Neon DB real

const BASE = 'https://santo-cuore-salud.vercel.app';

async function run() {
    console.log('='.repeat(60));
    console.log('TEST: Sistema Programático de Reservas - Santo Cuore');
    console.log('='.repeat(60));

    // ── TEST 1: GET SLOTS ─────────────────────────────────────────
    console.log('\n📅 TEST 1: Obtener slots disponibles (Traumatología)');
    const r1 = await fetch(`${BASE}/api/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_slots', especialidad: 'Traumatología' })
    });
    const d1 = await r1.json();
    console.log('Status:', r1.status);
    if (d1.slots) {
        console.log(`✅ ${d1.slots.length} slots devueltos`);
        d1.slots.forEach((s, i) => console.log(`   ${i + 1}. ${s.label}`));
    } else {
        console.log('❌ Error:', d1);
    }

    // ── TEST 2: CREATE BOOKING ────────────────────────────────────
    if (!d1.slots || d1.slots.length === 0) {
        console.log('\n⚠️  Sin slots disponibles para continuar prueba de booking');
        return;
    }

    const slotElegido = d1.slots[0];
    console.log(`\n📝 TEST 2: Crear reserva para slot: ${slotElegido.label}`);
    const r2 = await fetch(`${BASE}/api/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'create_booking',
            paciente: 'Juan Prueba Test',
            especialidad: 'Traumatología',
            fechaHora: slotElegido.iso,
            contacto: '1155667788'
        })
    });
    const d2 = await r2.json();
    console.log('Status:', r2.status);
    if (d2.success) {
        console.log('✅ Turno creado:', d2.mensaje);
    } else {
        console.log('❌ Error:', d2);
    }

    // ── TEST 3: SLOT NO DEBE REPETIRSE ────────────────────────────
    console.log('\n🔁 TEST 3: Verificar que el mismo slot ya no aparece');
    const r3 = await fetch(`${BASE}/api/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_slots', especialidad: 'Traumatología' })
    });
    const d3 = await r3.json();
    const slotRepetido = d3.slots?.find(s => s.iso === slotElegido.iso);
    if (!slotRepetido) {
        console.log('✅ Correcto: el slot ocupado no aparece en la lista');
    } else {
        console.log('❌ Bug: el slot ocupado sigue apareciendo');
    }

    // ── TEST 4: GET ADMIN APPOINTMENTS ───────────────────────────
    console.log('\n🔧 TEST 4: Admin endpoint - listar turnos');
    const r4 = await fetch(`${BASE}/api/appointments`);
    const d4 = await r4.json();
    console.log('Status:', r4.status);
    if (Array.isArray(d4)) {
        console.log(`✅ ${d4.length} turno(s) en DB`);
        if (d4.length > 0) {
            const t = d4[d4.length - 1];
            console.log(`   Último: ${t.patient} | ${t.specialty} | ${t.date} | ${t.status} | tel: ${t.phone}`);
        }
    } else {
        console.log('❌ Error:', d4);
    }

    // ── TEST 5: PATCH STATUS ──────────────────────────────────────
    if (Array.isArray(d4) && d4.length > 0) {
        const ultimoId = d4[d4.length - 1].id;
        console.log(`\n✏️  TEST 5: Cambiar estado del turno ID=${ultimoId} a "pendiente"`);
        const r5 = await fetch(`${BASE}/api/appointments`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ultimoId, status: 'pendiente' })
        });
        const d5 = await r5.json();
        console.log('Status:', r5.status);
        if (d5.status === 'pendiente') {
            console.log('✅ Estado actualizado a pendiente');
        } else {
            console.log('❌ Error:', d5);
        }

        // Limpieza: cancelar el turno de test
        await fetch(`${BASE}/api/appointments`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ultimoId, status: 'cancelado' })
        });
        console.log('   (turno de test marcado como cancelado para limpieza)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS LOS TESTS COMPLETADOS');
    console.log('='.repeat(60));
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
