import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-2.0-flash'),
        messages,
        system: `Eres el asistente virtual de recepción del Centro Médico Santo Cuore. 
    Tu objetivo es recolectar datos de forma amable y profesional para agendar un turno.
    
    FLUJO DE CONVERSACIÓN:
    1. Saluda y pregunta por la especialidad (Cardiología, Medicina Estética, Nutrición, etc.).
    2. Pregunta el nombre completo del paciente.
    3. Pregunta la fecha y hora preferida.
    
    REGLA CRÍTICA: Cada vez que el usuario te proporcione un dato nuevo (nombre, especialidad o fecha), DEBES invocar la herramienta 'actualizarResumenTurno' con la información actualizada.
    
    Mantén un tono empático, moderno y eficiente.`,
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
