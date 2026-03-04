/**
 * API de Reservas — Santo Cuore Salud
 * Sistema programático SIN motor de IA. 100% determinístico.
 *
 * POST /api/reservar
 *   { action: 'get_slots', especialidad: string }
 *   { action: 'create_booking', paciente, especialidad, fechaHora, contacto }
 */
import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

const getDb = () => neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

// ── SLOT GENERATOR ───────────────────────────────────────────────────────────
// Lun-Vie, 09:00-20:00, cada 30 minutos

function generateSlots(desde: Date): Date[] {
    const slots: Date[] = [];
    for (let d = 0; d < 14; d++) {
        const day = new Date(desde);
        day.setDate(day.getDate() + d);
        const dow = day.getDay();
        if (dow === 0 || dow === 6) continue; // sin fines de semana
        for (let h = 9; h < 20; h++) {
            for (const m of [0, 30]) {
                const slot = new Date(day);
                slot.setHours(h, m, 0, 0);
                if (slot > desde) slots.push(slot);
            }
        }
        if (slots.length >= 30) break;
    }
    return slots;
}

function fmtLong(d: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} a las ${hh}:${mm}`;
}

function fmtShort(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── HANDLER ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;

        // ── GET_SLOTS ─────────────────────────────────────────────────────────
        if (action === 'get_slots') {
            const { especialidad } = body;
            if (!especialidad) return json({ error: 'Especialidad requerida' }, 400);

            const now = new Date();
            const futuro = new Date(now);
            futuro.setDate(futuro.getDate() + 14);

            // Obtener slots ocupados de la DB
            let ocupados: Date[] = [];
            try {
                const sql = getDb();
                const rows = await sql`
                    SELECT fecha_hora FROM appointments
                    WHERE LOWER(especialidad) = LOWER(${especialidad})
                      AND fecha_hora >= NOW()
                      AND fecha_hora < ${futuro.toISOString()}
                      AND estado != 'cancelado'
                `;
                ocupados = rows.map((r: any) => new Date(r.fecha_hora));
            } catch (dbErr) {
                console.error('DB get_slots error (using all slots):', dbErr);
                // Degradación elegante: si falla la DB, devuelve todos los slots
            }

            const todos = generateSlots(now);
            const disponibles = todos.filter(s =>
                !ocupados.some(o => Math.abs(o.getTime() - s.getTime()) < 60_000)
            );

            const primeros6 = disponibles.slice(0, 6).map(s => ({
                iso: s.toISOString(),
                label: fmtLong(s),
                hora: fmtShort(s),
                fecha: s.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
            }));

            return json({ slots: primeros6 });
        }

        // ── CREATE_BOOKING ────────────────────────────────────────────────────
        if (action === 'create_booking') {
            const { paciente, especialidad, fechaHora, contacto } = body;
            if (!paciente || !especialidad || !fechaHora || !contacto) {
                return json({ error: 'Requerido: paciente, especialidad, fechaHora, contacto' }, 400);
            }

            const fechaDate = new Date(fechaHora);
            if (isNaN(fechaDate.getTime())) return json({ error: 'Fecha inválida' }, 400);

            const sql = getDb();

            // Verificar conflicto de slot
            const conflicto = await sql`
                SELECT id FROM appointments
                WHERE LOWER(especialidad) = LOWER(${especialidad})
                  AND ABS(EXTRACT(EPOCH FROM (fecha_hora - ${fechaDate.toISOString()}::timestamptz))) < 60
                  AND estado != 'cancelado'
            `;

            if (conflicto.length > 0) {
                return json({ error: 'El turno ya no está disponible. Elegí otro horario.', code: 'SLOT_TAKEN' }, 409);
            }

            // Insertar reserva
            await sql`
                INSERT INTO appointments (paciente, especialidad, fecha_hora, estado, contacto)
                VALUES (
                    ${paciente},
                    ${especialidad},
                    ${fechaDate.toISOString()}::timestamptz,
                    'confirmado',
                    ${contacto}
                )
            `;

            return json({
                success: true,
                mensaje: `Turno confirmado para ${paciente} en ${especialidad} — ${fmtLong(fechaDate)}.`,
                detalles: { paciente, especialidad, fechaHora: fmtLong(fechaDate), contacto }
            });
        }

        return json({ error: `Acción desconocida: ${action}` }, 400);

    } catch (err: any) {
        console.error('RESERVAR_API_ERROR:', err);
        return json({ error: 'Error interno', detail: String(err?.message || err) }, 500);
    }
}

function json(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

export default POST;
