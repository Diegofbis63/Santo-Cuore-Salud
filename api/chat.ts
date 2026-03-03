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

        const result = await streamText({
            model: google('gemini-2.5-flash'),
            messages,
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
      1. Usa un tono sumamente elegante y profesional (usa 'vos' de forma respetuosa).
      2. No des diagnósticos, solo recomienda al especialista adecuado.
      3. Importante: no pidas demasiados datos de una. Trata de mantener un flujo natural en la conversación.
      4. Si el paciente da su nombre o especialidad deseada, SIEMPRE utiliza la herramienta consultarDisponibilidad para buscar en la base de datos y ofrecerle los turnos.
      5. La IA registrará los datos detectados paralelamente mediante actualizarResumenTurno.`,
            tools: {
                consultarDisponibilidad: tool({
                    description: 'Consulta en la base de datos de la clínica los horarios y turnos disponibles para una especialidad.',
                    parameters: z.object({
                        especialidad: z.string().describe('La especialidad buscada (ej: dermatología, cardiología)'),
                    }),
                    execute: async ({ especialidad }) => {
                        console.log('Consultando DB para:', especialidad);
                        // Mock DB call:
                        const horariosDisponibles = [
                            'Mañana a las 10:00 AM',
                            'Mañana a las 04:30 PM',
                            'Pasado mañana a las 11:15 AM'
                        ];
                        return {
                            especialidad,
                            horarios: horariosDisponibles,
                            mensaje: `Base de datos consultada. Menciona textualmente al usuario estos horarios disponibles para ${especialidad} y pregúntale cuál prefiere.`
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
            },
            maxSteps: 5,
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
