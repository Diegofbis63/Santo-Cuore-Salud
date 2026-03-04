import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

const getDb = () => neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

// ── GET: Listar todos los turnos para el panel admin ─────────────────────────
export async function GET() {
    try {
        const sql = getDb();
        const rows = await sql`
            SELECT
                id,
                paciente        AS patient,
                especialidad    AS specialty,
                -- Si contacto empieza con 'tel:' → extraer el número, si con 'email:' → extraer email
                CASE
                    WHEN contacto LIKE 'tel:%'   THEN SUBSTRING(contacto FROM 5)
                    WHEN contacto LIKE 'email:%' THEN ''
                    ELSE contacto
                END             AS phone,
                CASE
                    WHEN contacto LIKE 'email:%' THEN SUBSTRING(contacto FROM 7)
                    ELSE ''
                END             AS email,
                CASE
                    WHEN contacto LIKE 'tel:%'   THEN 'telefono'
                    WHEN contacto LIKE 'email:%' THEN 'email'
                    ELSE 'otro'
                END             AS contact_type,
                TO_CHAR(fecha_hora AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD HH24:MI') AS date,
                estado          AS status
            FROM appointments
            ORDER BY fecha_hora ASC
        `;
        return json(rows);
    } catch (err) {
        console.error('GET /api/appointments error:', err);
        return json({ error: String(err) }, 500);
    }
}

// ── POST: Crear turno manualmente desde el admin ──────────────────────────────
export async function POST(req: Request) {
    try {
        const sql = getDb();
        const body = await req.json();
        const { patient, specialty, date, status = 'confirmado', phone = '', email = '' } = body;

        if (!patient || !specialty || !date) {
            return json({ error: 'Campos requeridos: patient, specialty, date' }, 400);
        }

        const contacto = phone || email || '';

        const result = await sql`
            INSERT INTO appointments (paciente, especialidad, fecha_hora, estado, contacto)
            VALUES (
                ${patient},
                ${specialty},
                ${date}::timestamptz,
                ${status},
                ${contacto}
            )
            RETURNING
                id,
                paciente        AS patient,
                especialidad    AS specialty,
                contacto        AS phone,
                ''              AS email,
                TO_CHAR(fecha_hora AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD HH24:MI') AS date,
                estado          AS status
        `;

        return json(result[0], 201);
    } catch (err) {
        console.error('POST /api/appointments error:', err);
        return json({ error: String(err) }, 500);
    }
}

// ── PATCH: Cambiar estado del turno ───────────────────────────────────────────
export async function PATCH(req: Request) {
    try {
        const sql = getDb();
        const { id, status } = await req.json();

        if (!id || !status) return json({ error: 'Requerido: id, status' }, 400);

        const validStatuses = ['pendiente', 'confirmado', 'cancelado'];
        if (!validStatuses.includes(status)) {
            return json({ error: `Estado inválido. Válidos: ${validStatuses.join(', ')}` }, 400);
        }

        const result = await sql`
            UPDATE appointments
            SET estado = ${status}
            WHERE id = ${id}
            RETURNING id, estado AS status
        `;

        if (result.length === 0) return json({ error: 'Turno no encontrado' }, 404);

        return json(result[0]);
    } catch (err) {
        console.error('PATCH /api/appointments error:', err);
        return json({ error: String(err) }, 500);
    }
}

// ── PUT: Editar todos los detalles de un turno ────────────────────────────────
export async function PUT(req: Request) {
    try {
        const sql = getDb();
        const body = await req.json();
        const { id, patient, specialty, date, status, phone, email } = body;

        if (!id) return json({ error: 'Requerido: id' }, 400);

        const contacto = phone || email || null;

        // Actualizar solo los campos provistos
        const result = await sql`
            UPDATE appointments
            SET
                paciente     = CASE WHEN ${patient || null}::text IS NOT NULL THEN ${patient || null} ELSE paciente END,
                especialidad = CASE WHEN ${specialty || null}::text IS NOT NULL THEN ${specialty || null} ELSE especialidad END,
                fecha_hora   = CASE WHEN ${date || null}::text IS NOT NULL THEN ${date || null}::timestamptz ELSE fecha_hora END,
                estado       = CASE WHEN ${status || null}::text IS NOT NULL THEN ${status || null} ELSE estado END,
                contacto     = CASE WHEN ${contacto}::text IS NOT NULL THEN ${contacto} ELSE contacto END
            WHERE id = ${id}
            RETURNING
                id,
                paciente        AS patient,
                especialidad    AS specialty,
                contacto        AS phone,
                ''              AS email,
                TO_CHAR(fecha_hora AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD HH24:MI') AS date,
                estado          AS status
        `;

        if (result.length === 0) return json({ error: 'Turno no encontrado' }, 404);
        return json(result[0]);
    } catch (err) {
        console.error('PUT /api/appointments error:', err);
        return json({ error: String(err) }, 500);
    }
}

function json(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}
