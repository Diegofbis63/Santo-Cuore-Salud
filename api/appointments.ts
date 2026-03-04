import { neon } from '@neondatabase/serverless';

export const config = {
    runtime: 'edge',
};

// GET: Obtener todos los turnos con datos del paciente cruzados
export async function GET(req: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const appointments = await sql`
            SELECT 
                a.id,
                p.nombre as patient,
                p.telefono as phone,
                p.email,
                a.especialidad as specialty,
                TO_CHAR(a.fecha_hora, 'YYYY-MM-DD HH24:MI') as date,
                a.estado as status
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            ORDER BY a.fecha_hora ASC
        `;
        return new Response(JSON.stringify(appointments), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

// POST: Crear un nuevo turno (e insertar/actualizar paciente si no existe)
export async function POST(req: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const body = await req.json();

        // El email es requerido en DB por el esquema actual (UNIQUE NOT NULL).
        // Si no lo proveen, generamos un identificador único para no fallar.
        const safeEmail = body.email || `paciente_${Date.now()}@santocuore.local`;

        // 1. Insertar o recuperar paciente
        const patientResult = await sql`
            INSERT INTO patients (nombre, telefono, email)
            VALUES (${body.patient}, ${body.phone || null}, ${safeEmail})
            ON CONFLICT (email) DO UPDATE 
            SET nombre = EXCLUDED.nombre, telefono = EXCLUDED.telefono
            RETURNING id
        `;
        const patientId = patientResult[0].id;

        // 2. Insertar turno
        const aptResult = await sql`
            INSERT INTO appointments (patient_id, especialidad, fecha_hora, estado)
            VALUES (${patientId}, ${body.specialty}, ${body.date}, ${body.status})
            RETURNING id, especialidad as specialty, TO_CHAR(fecha_hora, 'YYYY-MM-DD HH24:MI') as date, estado as status
        `;

        const newApt = {
            id: aptResult[0].id,
            patient: body.patient,
            phone: body.phone,
            email: body.email,
            specialty: aptResult[0].specialty,
            date: aptResult[0].date,
            status: aptResult[0].status
        };

        return new Response(JSON.stringify(newApt), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

// PATCH: Actualizar el estado de un turno (usado por los botones check/cruz/reloj)
export async function PATCH(req: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id, status } = await req.json();

        if (!id || !status) {
            return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
        }

        const result = await sql`
            UPDATE appointments 
            SET estado = ${status} 
            WHERE id = ${id}
            RETURNING id, estado as status
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Turno no encontrado' }), { status: 404 });
        }

        return new Response(JSON.stringify(result[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

// PUT: Editar todos los detalles de un turno y su paciente
export async function PUT(req: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const body = await req.json();
        const { id, patient, phone, email, specialty, date, status } = body;

        if (!id) return new Response(JSON.stringify({ error: 'Faltan ID del turno' }), { status: 400 });

        // 1. Obtener patient_id desde el turno actual
        const aptContext = await sql`SELECT patient_id FROM appointments WHERE id = ${id}`;
        if (aptContext.length === 0) return new Response(JSON.stringify({ error: 'Turno no encontrado' }), { status: 404 });

        const patientId = aptContext[0].patient_id;

        // 2. Actualizar datos del paciente
        const safeEmail = email || `paciente_${Date.now()}@santocuore.local`;
        await sql`
            UPDATE patients
            SET nombre = ${patient}, telefono = ${phone || null}, email = ${safeEmail}
            WHERE id = ${patientId}
        `;

        // 3. Actualizar datos del turno
        const aptResult = await sql`
            UPDATE appointments
            SET especialidad = ${specialty}, fecha_hora = ${date}, estado = ${status}
            WHERE id = ${id}
            RETURNING id, especialidad as specialty, TO_CHAR(fecha_hora, 'YYYY-MM-DD HH24:MI') as date, estado as status
        `;

        const updatedApt = {
            id: aptResult[0].id,
            patient, phone, email: safeEmail,
            specialty: aptResult[0].specialty,
            date: aptResult[0].date,
            status: aptResult[0].status
        };

        return new Response(JSON.stringify(updatedApt), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}
