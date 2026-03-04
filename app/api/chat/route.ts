import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // ── SLIDING WINDOW ──────────────────────────────────────────────────────────
    // Solo enviamos los últimos 5 mensajes al modelo.
    // Evita que conversaciones largas consuman tokens de forma exponencial.
    const windowedMessages = messages.slice(-5);

    const result = await streamText({
        model: google('gemini-2.5-flash-preview-04-17'),

        // ── MAX TOKENS (CEPO DE SALIDA) ─────────────────────────────────────────
        // Fuerza respuestas cortas. Protege la cuota gratuita de la API Key.
        maxTokens: 200,

        // ── SYSTEM PROMPT MINIMALISTA ───────────────────────────────────────────
        // Telegráfico y sin relleno. Cada palabra aquí cuesta tokens de entrada.
        system: `Rol: Recepcionista Santo Cuore (Centro de Salud y Medicina Estética).
Tarea: Recolectar datos para agendar turno en máximo 3 pasos.
Paso 1: Especialidad (Cardiología, Estética, Nutrición, Clínica Gral).
Paso 2: Nombre completo del paciente.
Paso 3: Fecha y hora preferida.
Regla 1: Respuestas ≤ 2 líneas. Sin saludos largos.
Regla 2: Invocar 'actualizarResumenTurno' cada vez que el usuario dé un dato nuevo.
Regla 3: Tono profesional y cálido. Nada de listas largas.`,

        messages: windowedMessages,

        tools: {
            actualizarResumenTurno: tool({
                description: 'Actualiza el resumen visual del turno en la interfaz del cliente',
                parameters: z.object({
                    paciente: z.string().describe('Nombre completo del paciente'),
                    especialidad: z.string().describe('Especialidad médica solicitada'),
                    fechaHora: z.string().describe('Fecha y hora del turno')
                }),
                execute: async ({ paciente, especialidad, fechaHora }) => {
                    return { success: true, updated: { paciente, especialidad, fechaHora } };
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
