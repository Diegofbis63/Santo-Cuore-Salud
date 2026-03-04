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
      
      DISPONIBILIDAD FIJA DE AGENDA:
      - Mañana a las 10:00 (10:00 AM)
      - Mañana a las 16:30 (4:30 PM)  
      - Pasado mañana a las 11:15 (11:15 AM)
      
      === FLUJO OBLIGATORIO PASO A PASO (NO SALTEAR PASOS) ===
      
      PASO 1 — ESPECIALIDAD: Si el paciente no la mencionó, preguntá cuál necesita.
      PASO 2 — NOMBRE: Si el paciente no lo mencionó, pedí su nombre completo.
      PASO 3 — OFRECER HORARIOS: Una vez que tenés especialidad y nombre, ofrecé los 3 turnos disponibles en formato fluido y persuasivo. Ejemplo: "Tenemos disponible mañana a las 10 de la mañana, mañana a las 16:30, o pasado mañana a las 11 y cuarto. ¿Cuál te queda mejor?"
      PASO 4 — CONFIRMAR: Cuando el paciente ELIJA o MENCIONE cualquier hora o día —incluso si no coincide exactamente con los que ofreciste— registrá lo que dijo como fechaHora y usando 'confirmarTurno' despídete cálidamente. NO repitas los horarios disponibles si el paciente ya eligió uno.
      
      === REGLAS CRÍTICAS ===
      
      DETECCIÓN DE ELECCIÓN DE TURNO: Si el usuario dice cualquier cosa que incluya una hora, una fecha, "mañana", "pasado mañana", "el jueves", "a las X", "esa", "el primero", "el último", etc., debe interpretarse como que ELIGIÓ un turno. En ese caso:
        - Llenar el campo fechaHora con lo que dijo el paciente (ejemplo: "Mañana a las 16:30")
        - Usar la herramienta 'confirmarTurno' (NO 'actualizarResumenTurno')
        - Confirmar el turno calurosamente y cerrar la conversación
        - NUNCA volver a ofrecer los horarios disponibles después de que el paciente eligió
      
      REGLAS GENERALES:
      1. Usa un tono elegante y cálido (usa 'vos' de forma respetuosa).
      2. No des diagnósticos, solo orientá al especialista adecuado.
      3. SIEMPRE invocar una herramienta por mensaje ('actualizarResumenTurno' si el flujo sigue, 'confirmarTurno' si el turno fue elegido).
      4. TODO el texto de tu respuesta verbal va SIEMPRE en el parámetro "respuesta" de la herramienta.
      5. PALABRAS PROHIBIDAS: "base de datos", "sistemas", "IA", "procesando", "buscando".`,
            tools: {
                actualizarResumenTurno: tool({
                    description: 'Usar cuando aún estás recopilando datos del turno (especialidad, nombre, horario aún no elegido). Contiene tu respuesta verbal al usuario.',
                    parameters: z.object({
                        paciente: z.string().optional().describe('Nombre completo del paciente si ya lo dijo'),
                        especialidad: z.string().optional().describe('Especialidad médica si ya la dijo'),
                        fechaHora: z.string().optional().describe('Fecha/hora si ya la dijo (cualquier formato que el paciente usó)'),
                        respuesta: z.string().describe('Tu respuesta verbal completa que se mostrará al paciente en el chat')
                    }),
                    execute: async (args) => {
                        return { updated: args };
                    }
                }),
                confirmarTurno: tool({
                    description: 'USAR SOLO cuando el paciente ya eligió un horario (menciona cualquier hora, día, o elige una de las opciones). Finaliza la reserva y cierra la conversación.',
                    parameters: z.object({
                        paciente: z.string().describe('Nombre completo del paciente'),
                        especialidad: z.string().describe('Especialidad confirmada'),
                        fechaHora: z.string().describe('Fecha y hora elegida por el paciente (exactamente como lo dijo)'),
                        confirmado: z.boolean().describe('Siempre true'),
                        respuesta: z.string().describe('Mensaje cálido de despedida confirmando el turno. Incluir nombre, especialidad y fecha. Decirle que lo esperamos en la clínica.')
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
