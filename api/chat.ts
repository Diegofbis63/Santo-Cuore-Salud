import { neon } from '@neondatabase/serverless';

export const config = {
    runtime: 'edge',
};

const getDb = () => neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

// ── CONFIGURACIÓN Y DATA ──────────────────────────────────────────────────────

const ESPECIALIDADES = [
    'Traumatología', 'Cardiología', 'Pediatría',
    'Ginecología', 'Dermatología', 'Nutrición', 'Medicina Estética'
];

interface Slot {
    iso: string;
    label: string;
}

// ── UTILS ────────────────────────────────────────────────────────────────────

function generateSlots(desde: Date): Date[] {
    const slots: Date[] = [];
    for (let d = 0; d < 14; d++) {
        const day = new Date(desde);
        day.setDate(day.getDate() + d);
        if (day.getDay() === 0 || day.getDay() === 6) continue;
        for (let h = 9; h < 20; h++) {
            for (const m of [0, 30]) {
                const slot = new Date(day);
                slot.setHours(h, m, 0, 0);
                if (slot > desde) slots.push(slot);
            }
        }
        if (slots.length >= 20) break;
    }
    return slots;
}

function fmtLong(d: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} p/ las ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── LÓGICA DE DETECCIÓN ──────────────────────────────────────────────────────

function findEspecialidad(history: string[]) {
    return ESPECIALIDADES.find(e => history.some(h => h.toLowerCase().includes(e.toLowerCase())));
}

function findSlot(text: string, slots: Date[]) {
    // Busca coincidencias de hora o palabras clave
    return slots.find(s => {
        const timeStr = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`;
        return text.includes(timeStr) || (text.includes('10') && s.getHours() === 10) || (text.includes('16') && s.getHours() === 16);
    });
}

// ── HANDLER PRINCIPAL ────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const userMessages = messages.filter((m: any) => m.role === 'user');
        const lastMsg = userMessages[userMessages.length - 1]?.content || "";
        const historyText = userMessages.map((m: any) => m.content).join(' ');

        // Heurísticas de extracción
        const especialidad = findEspecialidad([historyText]);
        const contacto = lastMsg.match(/\d{8,}/) || lastMsg.includes('@') ? lastMsg : null;

        // Suposición de nombre: si hay especialidad pero no contacto, y el msg no es de tiempo
        const likelyName = userMessages.find((m: any) => {
            const c = m.content.toLowerCase();
            return c.split(' ').length >= 2 && !ESPECIALIDADES.some(e => c.includes(e.toLowerCase())) && !c.includes(':') && !c.includes('1');
        })?.content;

        let responseText = "";

        if (!especialidad) {
            responseText = "¡Hola! Soy el asistente virtual de Santo Cuore. ¿En qué especialidad estás buscando un turno? (Traumatología, Cardiología, Pediatría, etc.)";
        } else if (!likelyName) {
            responseText = `Perfecto, agendamos para **${especialidad}**. ¿Cuál es tu nombre completo, por favor?`;
        } else {
            // Tenemos Especialidad y Nombre -> Ofrecer Slots
            const now = new Date();
            const allSlots = generateSlots(now);

            // Verificamos si el usuario ya eligió un slot
            const chosenSlot = findSlot(lastMsg, allSlots);

            if (!chosenSlot) {
                const s1 = allSlots[0];
                const s2 = allSlots[2];
                const s3 = allSlots[4];
                responseText = `Perfecto, ${likelyName.split(' ')[0]}. Tenemos disponible ${fmtLong(s1)}, ${fmtLong(s2)} o ${fmtLong(s3)}. ¿Cuál te queda mejor?`;
            } else if (!contacto) {
                responseText = `Excelente elección para el ${fmtLong(chosenSlot)}. Para completar tu reserva necesito un dato de contacto. ¿Me podés dar tu número de teléfono o correo electrónico?`;
            } else {
                // TODO: Insertar en DB de forma real aquí
                try {
                    const sql = getDb();
                    await sql`
                        INSERT INTO appointments (paciente, especialidad, fecha_hora, estado, contacto)
                        VALUES (${likelyName}, ${especialidad}, ${chosenSlot.toISOString()}::timestamptz, 'confirmado', ${contacto})
                    `;
                } catch (e) {
                    console.error("DB Insert failed in chat api:", e);
                }

                responseText = `¡Listo, ${likelyName.split(' ')[0]}! Tu turno para **${especialidad}** el **${fmtLong(chosenSlot)}** ha sido confirmado. \n\nTe esperamos en 9 de Julio 660. ¡Gracias por confiar en Santo Cuore!`;
            }
        }

        // Simular stream para compatibilidad con useChat
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(responseText)}\n`));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (err: any) {
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
}

export default POST;
