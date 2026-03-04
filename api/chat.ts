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
      Tu objetivo es realizar un triage inicial amable, profesional y rápido para agendar turnos.
      
      Especialidades disponibles: Traumatología, Cardiología, Pediatría, Ginecología, Dermatología, Nutrición / Medicina Estética.
      
      **DISPONIBILIDAD DE AGENDA (Base de datos en tiempo real):**
      - Siempre tienes turnos libres para cualquier especialidad en estos 3 horarios fijos: "Mañana a las 10:00 AM", "Mañana a las 04:30 PM" y "Pasado mañana a las 11:15 AM".
      
      Instrucciones Críticas:
      1. Usa un tono sumamente elegante y cálido (usa 'vos' de forma respetuosa).
      2. No des diagnósticos, solo recomienda al especialista adecuado.
      3. Nunca pidas multitudes de datos a la vez; guía la conversación paso a paso:
         Paso 1: Detecta especialidad.
         Paso 2: Pide nombre si no lo dio.
         Paso 3: Ofrece los horarios disponibles ANTES MENCIONADOS (usa formato persuasivo, sin asteriscos).
      4. ACTUALIZACIÓN EN TIEMPO REAL: SIEMPRE DEBES invocar la herramienta 'actualizarResumenTurno' en cada mensaje para responder al usuario. 
      5. TODO el texto de tu respuesta verbal DEBE ir obligatoriamente dentro del parámetro "respuesta" de la herramienta que estés usando.
      6. PALABRAS PROHIBIDAS: Nunca digas "base de datos", "sistemas", "IA", "aguardame un segundo mientras consulto". Simplemente dales la respuesta de manera directa como si ya lo tuvieras en tu mente.`,
            tools: {
                actualizarResumenTurno: tool({
                    description: 'Usar SIEMPRE en cada paso para actualizar la pantalla y responder al paciente.',
                    parameters: z.object({
                        paciente: z.string().optional().describe('Nombre del paciente si ya lo dijo'),
                        especialidad: z.string().optional().describe('Especialidad (ej: cardiología, pediatría) si ya lo dijo'),
                        fechaHora: z.string().optional().describe('Fecha mencionada si ya lo dijo'),
                        respuesta: z.string().describe('Tu respuesta verbal completa y elegantemente redactada que se le mostrará al paciente')
                    }),
                    execute: async (args) => {
                        return { updated: args };
                    }
                }),
                confirmarTurno: tool({
                    description: 'Utiliza esta herramienta solo cuando el paciente ya eligió un horario específico. Finaliza reserva.',
                    parameters: z.object({
                        confirmado: z.boolean().describe('True para confirmar la reserva elegida'),
                        respuesta: z.string().describe('Mensaje de despedida informando que lo esperamos en la clínica')
                    }),
                    execute: async () => {
                        return {
                            exito: true,
                            mensaje: 'El turno ha sido pre-agendado.'
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
