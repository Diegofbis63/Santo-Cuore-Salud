import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// We run as a Node.js serverless function to ensure streams and `fetch` work 100% reliably.

export const config = {
    runtime: 'edge',
};

export async function POST(req: Request) {
    try {
        const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyCMZCEHIuyOXYqGv0df0W5wLlztn_XzFcs";

        const google = createGoogleGenerativeAI({
            apiKey: key,
        });
        const { messages } = await req.json();

        // ── SLIDING WINDOW ──────────────────────────────────────────────────────────
        // Solo enviamos los últimos 6 mensajes al modelo. Evita consumir tokens gratis rápidamente.
        const windowedMessages = messages.slice(-6);

        const result = await streamText({
            model: google('gemini-2.5-flash'),
            maxRetries: 0,
            messages: windowedMessages,
            system: `Eres la "Recepcionista Digital Inteligente de Santo Cuore", una clínica médica premium de alta gama.
      Tu objetivo es agendar turnos médicos de forma amable, rápida y eficiente.
      
      Especialidades disponibles: Traumatología, Cardiología, Pediatría, Ginecología, Dermatología, Nutrición / Medicina Estética.
      
      DISPONIBILIDAD FIJA DE AGENDA (usar SIEMPRE formato 24hs, nunca AM/PM ni texto):
      - Mañana a las 10:00
      - Mañana a las 16:30
      - Pasado mañana a las 11:15
      
      === FLUJO OBLIGATORIO PASO A PASO (NO SALTEAR NINGÚN PASO) ===
      
      PASO 1 — ESPECIALIDAD: Si el paciente no la mencionó, preguntá cuál necesita.
      PASO 2 — NOMBRE: Si el paciente no lo dijo, pedí su nombre completo.
      PASO 3 — OFRECER HORARIOS: Con especialidad y nombre confirmados, ofrecé los 3 horarios en formato 24hs. Ejemplo CORRECTO: "Tenemos disponible mañana a las 10:00, mañana a las 16:30, o pasado mañana a las 11:15. ¿Cuál te queda mejor?" NUNCA digas "11 y cuarto", "cuatro y media", "10 de la mañana" ni formatos AM/PM.
      PASO 4 — CONTACTO: Cuando el paciente elija un horario, ANTES de confirmar, pedí un dato de contacto: número de teléfono y/o correo electrónico. Ejemplo: "Perfecto, para completar tu reserva necesito un dato de contacto. ¿Me podés dar tu número de teléfono o correo electrónico?"
      PASO 5 — CONFIRMAR: Una vez que el paciente proporcionó el dato de contacto, usando 'confirmarTurno' despedite cálidamente con todos los datos del turno. NO repitas los horarios disponibles.
      
      === REGLAS CRÍTICAS ===
      
      DETECCIÓN DE ELECCIÓN DE TURNO: Si el usuario dice cualquier cosa que incluya una hora, una fecha, "mañana", "pasado mañana", "el jueves", "a las X", "esa", "el primero", "el último", etc., debe interpretarse como que ELIGIÓ un horario. En ese caso NO confirmes aún — pasá al PASO 4 y pedí el dato de contacto.
      
      DETECCIÓN DE CONTACTO: Si el usuario da un número de teléfono (ej: "11 1234 5678") o un email (ej: "juan@mail.com"), registralo inmediatamente y procedé a usar 'confirmarTurno'.
      
      FORMATO DE HORARIOS (CRÍTICO): SIEMPRE usar formato 24hs con dos puntos. NUNCA usar texto como "y cuarto", "y media", "de la tarde", "AM", "PM". Las horas SIEMPRE van así: 10:00, 16:30, 11:15.
      
      REGLAS GENERALES:
      1. Usa un tono elegante y cálido (usa 'vos' de forma respetuosa).
      2. No des diagnósticos, solo orientá al especialista adecuado.
      3. SIEMPRE invocar una herramienta por mensaje ('actualizarResumenTurno' mientras se recopilan datos, 'confirmarTurno' solo cuando tenés: nombre + especialidad + fechaHora + contacto).
      4. TODO el texto de tu respuesta verbal va SIEMPRE en el parámetro "respuesta" de la herramienta.
      5. PALABRAS PROHIBIDAS: "base de datos", "sistemas", "IA", "procesando", "buscando".`,
            tools: {
                actualizarResumenTurno: tool({
                    description: 'Usar cuando aún estás recopilando datos del turno. Contiene tu respuesta verbal al usuario.',
                    parameters: z.object({
                        paciente: z.string().optional().describe('Nombre completo del paciente si ya lo dijo'),
                        especialidad: z.string().optional().describe('Especialidad médica si ya la dijo'),
                        fechaHora: z.string().optional().describe('Fecha/hora en formato 24hs si ya la eligió (ej: "Mañana a las 16:30")'),
                        contacto: z.string().optional().describe('Teléfono o email si ya lo proporcionó'),
                        respuesta: z.string().describe('Tu respuesta verbal completa que se mostrará al paciente en el chat')
                    }),
                    execute: async (args) => {
                        return { updated: args };
                    }
                }),
                confirmarTurno: tool({
                    description: 'USAR SOLO cuando tenés: nombre + especialidad + fechaHora + contacto del paciente. Finaliza la reserva y cierra la conversación.',
                    parameters: z.object({
                        paciente: z.string().describe('Nombre completo del paciente'),
                        especialidad: z.string().describe('Especialidad confirmada'),
                        fechaHora: z.string().describe('Fecha y hora en formato 24hs (ej: "Mañana a las 16:30")'),
                        contacto: z.string().describe('Teléfono y/o email del paciente'),
                        confirmado: z.boolean().describe('Siempre true'),
                        respuesta: z.string().describe('Mensaje cálido de despedida confirmando el turno con todos los datos: nombre, especialidad, fecha y contacto. Decirle que lo esperamos en la clínica.')
                    }),
                    execute: async () => {
                        return {
                            exito: true,
                            mensaje: 'Turno reservado exitosamente.'
                        };
                    }
                }),
            },
            maxSteps: 1, // Previene llamadas múltiples al LLM que agotan los límites de la API Key gratuita.
        });

        return result.toDataStreamResponse();
    } catch (err: any) {
        console.error('CHAT_API_CRITICAL_FAILURE:', err);
        return new Response(JSON.stringify({
            error: 'Error de conexión con el asistente virtual.',
            hint: 'Verifica tu conexión o reintenta en unos segundos.',
            rawError: String(err.message || err.toString())
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export default POST;
