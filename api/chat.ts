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
      Tu objetivo es realizar un triage inicial amable, profesional y rápido.
      
      Debes orientar al paciente según sus síntomas a una de estas especialidades:
      - Traumatología
      - Cardiología
      - Pediatría
      - Ginecología
      - Dermatología
      - Nutrición / Medicina Estética (Especialidades VIP)
      
      Instrucciones Críticas:
      1. Usa un tono sumamente elegante y cálido (usa 'vos' de forma respetuosa).
      2. No des diagnósticos, solo recomienda al especialista adecuado.
      3. Nunca pidas multitudes de datos a la vez; guía la conversación paso a paso (primero especialidad, luego nombre, luego opciones de turnos).
      4. Si el paciente menciona una especialidad, siempre utiliza la herramienta consultarDisponibilidad de forma invisible (sin advertirle que "andas buscando", hazlo como una secretaria humana).
      5. La IA registrará los datos detectados paralelamente mediante actualizarResumenTurno.
      6. REGLA DE FORMATO AL LISTAR HORARIOS: No utilices listas con asteriscos (*), formatea los horarios de modo fluido y persuasivo (Ejemplo: "Te cuento que tengo disponibilidad para mañana a las 10:00 o a las 16:30. También podría ser el jueves a las 11:15. ¿Qué te queda más cómodo?").
      7. PALABRAS PROHIBIDAS: Nunca digas "base de datos", "sistemas", "IA", "inteligencia artificial" o "procesando". Debes actuar siempre como una prestigiosa recepcionista de carne y hueso.
      8. REGLA VISUAL DE ESPERA: Si vas a requerir un segundo al usar herramientas de fondo, en el mismo mensaje introduce una fase suave, como por ejemplo: "Aguardame un segundo mientras reviso la agenda..." o "Dame un instante que verifico los turnos..."`,
            tools: {
                consultarDisponibilidad: tool({
                    description: 'Consulta los horarios y turnos que están libres para la clínica.',
                    parameters: z.object({
                        especialidad: z.string().describe('La especialidad buscada (ej: dermatología, cardiología)'),
                    }),
                    execute: async ({ especialidad }) => {
                        console.log('Consultando agenda para:', especialidad);
                        // Mock DB call:
                        const horariosDisponibles = [
                            'Mañana a las 10:00 AM',
                            'Mañana a las 04:30 PM',
                            'Pasado mañana a las 11:15 AM'
                        ];
                        return {
                            especialidad,
                            horarios: horariosDisponibles,
                            mensaje: `Hay turnos libres. Preséntaselos elegantemente, sin lenguaje de máquina o listas toscas.`
                        };
                    }
                }),
                actualizarResumenTurno: tool({
                    description: 'Actualiza automáticamente la pantalla con los datos que dio el paciente (nombre, especialidad o fecha), si alguno falta envíalo vacío.',
                    parameters: z.object({
                        paciente: z.string().optional().describe('Nombre del paciente'),
                        especialidad: z.string().optional().describe('Especialidad (ej: cardiología, pediatría)'),
                        fechaHora: z.string().optional().describe('Fecha mencionada')
                    }),
                    execute: async (args) => {
                        console.log('Ejecutando actualizarResumenTurno en server:', args);
                        return { updated: args };
                    }
                }),
                confirmarTurno: tool({
                    description: 'Utiliza esta herramienta solo cuando el paciente ya eligió un horario específico de los que le ofreciste y ya sabes su nombre. Finaliza el proceso de reserva.',
                    parameters: z.object({
                        confirmado: z.boolean().describe('True para confirmar la reserva elegida')
                    }),
                    execute: async () => {
                        return {
                            exito: true,
                            mensaje: 'El turno ha sido pre-agendado. Cierra la conversación de forma cálida indicando que lo esperamos en la clínica. NUNCA pidas más datos.'
                        };
                    }
                }),
            },
            maxSteps: 2,
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
