/**
 * API de Reservas — Santo Cuore Salud
 * Sistema programático de turnos SIN motor de IA.
 * 100% determinístico, sin límites de API ni costos externos.
 *
 * Acciones disponibles:
 *   POST /api/reservar
 *   { action: 'get_slots', especialidad: string }
 *   { action: 'create_booking', paciente, especialidad, fechaHora, contacto }
 */

export const config = { runtime: 'edge' };

const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

// ── HELPERS ─────────────────────────────────────────────────────────────────

async function query(sql: string, params: any[] = []) {
    const { Pool } = await import('@neondatabase/serverless') as any;
    const pool = new Pool({ connectionString: DB_URL });
    try {
        const result = await pool.query(sql, params);
        return result.rows;
    } finally {
        await pool.end();
    }
}

// Genera slots disponibles: Lun-Vie 09:00-20:00, cada 30 min
function generateSlots(fechaBase: Date): Date[] {
    const slots: Date[] = [];
    // Día base (0=Dom, 1=Lun ... 5=Vie, 6=Sab)
    for (let d = 0; d < 14; d++) {
        const day = new Date(fechaBase);
        day.setDate(day.getDate() + d);
        const dow = day.getDay();
        if (dow === 0 || dow === 6) continue; // saltear fin de semana
        for (let h = 9; h < 20; h++) {
            for (const m of [0, 30]) {
                const slot = new Date(day);
                slot.setHours(h, m, 0, 0);
                if (slot > fechaBase) slots.push(slot);
            }
        }
        if (slots.length >= 30) break; // máximo 30 slots por consulta
    }
    return slots;
}

function formatSlot(date: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} a las ${hh}:${mm}`;
}

function formatSlotShort(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

// ── MAIN HANDLER ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;

        // ─── GET AVAILABLE SLOTS ──────────────────────────────────────────────
        if (action === 'get_slots') {
            const { especialidad } = body;
            if (!especialidad) {
                return json({ error: 'Especialidad requerida' }, 400);
            }

            // Obtener turns ya ocupados para esa especialidad (próximos 14 días)
            const now = new Date();
            const futuro = new Date(now);
            futuro.setDate(futuro.getDate() + 14);

            let ocupados: Date[] = [];
            try {
                const rows = await query(
                    `SELECT fecha_hora FROM appointments 
           WHERE LOWER(especialidad) = LOWER($1) 
             AND fecha_hora >= NOW() 
             AND fecha_hora < $2
             AND estado != 'cancelado'`,
                    [especialidad, futuro.toISOString()]
                );
                ocupados = rows.map((r: any) => new Date(r.fecha_hora));
            } catch (e) {
                console.error('DB query error (get_slots):', e);
                // Si la DB falla, devolver slots sin filtrar (degradación elegante)
            }

            // Generar todos los slots y filtrar los ocupados
            const todos = generateSlots(now);
            const disponibles = todos.filter(slot =>
                !ocupados.some(o => Math.abs(o.getTime() - slot.getTime()) < 60000)
            );

            // Devolver los primeros 6 disponibles con formato
            const primeros6 = disponibles.slice(0, 6).map(s => ({
                iso: s.toISOString(),
                label: formatSlot(s),
                hora: formatSlotShort(s),
                fecha: s.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
            }));

            return json({ slots: primeros6 });
        }

        // ─── CREATE BOOKING ───────────────────────────────────────────────────
        if (action === 'create_booking') {
            const { paciente, especialidad, fechaHora, contacto } = body;
            if (!paciente || !especialidad || !fechaHora || !contacto) {
                return json({ error: 'Faltan campos obligatorios: paciente, especialidad, fechaHora, contacto' }, 400);
            }

            const fechaDate = new Date(fechaHora);
            if (isNaN(fechaDate.getTime())) {
                return json({ error: 'Fecha inválida' }, 400);
            }

            try {
                // Verificar que el slot no esté tomado
                const conflicto = await query(
                    `SELECT id FROM appointments 
           WHERE LOWER(especialidad) = LOWER($1) 
             AND fecha_hora = $2 
             AND estado != 'cancelado'`,
                    [especialidad, fechaDate.toISOString()]
                );

                if (conflicto.length > 0) {
                    return json({ error: 'El turno seleccionado ya no está disponible. Por favor elegí otro horario.', code: 'SLOT_TAKEN' }, 409);
                }

                // Insertar reserva
                await query(
                    `INSERT INTO appointments (especialidad, fecha_hora, estado, notas, contacto)
           VALUES ($1, $2, 'confirmado', $3, $4)`,
                    [especialidad, fechaDate.toISOString(), `Paciente: ${paciente}`, contacto]
                );

                return json({
                    success: true,
                    mensaje: `Turno confirmado para ${paciente} en ${especialidad} el ${formatSlot(fechaDate)}.`,
                    detalles: { paciente, especialidad, fechaHora: formatSlot(fechaDate), contacto }
                });
            } catch (dbError: any) {
                console.error('DB error (create_booking):', dbError);

                // Puede ser que falte la columna contacto/notas — intentar sin ella
                try {
                    await query(
                        `INSERT INTO appointments (especialidad, fecha_hora, estado)
             VALUES ($1, $2, 'confirmado')`,
                        [especialidad, fechaDate.toISOString()]
                    );
                    return json({
                        success: true,
                        mensaje: `Turno confirmado para ${paciente} en ${especialidad}.`,
                        detalles: { paciente, especialidad, fechaHora: formatSlot(fechaDate), contacto }
                    });
                } catch (e2) {
                    throw e2;
                }
            }
        }

        return json({ error: `Acción desconocida: ${action}` }, 400);

    } catch (err: any) {
        console.error('RESERVAR_API_ERROR:', err);
        return json({
            error: 'Error interno del servidor',
            detail: String(err?.message || err)
        }, 500);
    }
}

function json(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

export default POST;
