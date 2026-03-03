import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const key = "AIzaSyCMZCEHIuyOXYqGv0df0W5wLlztn_XzFcs";
const google = createGoogleGenerativeAI({ apiKey: key });

async function run() {
    try {
        const result = await streamText({
            model: google('gemini-2.5-flash'),
            messages: [{ role: 'user', content: 'hola me llamo pablo busco pediatra' }],
            tools: {
                actualizarResumenTurno: tool({
                    description: 'Actualiza automáticamente la pantalla con los datos que dio el paciente.',
                    parameters: z.object({
                        paciente: z.string().optional().describe('Nombre del paciente'),
                        especialidad: z.string().optional().describe('Especialidad (ej: cardiología, pediatría)'),
                        fechaHora: z.string().optional().describe('Fecha mencionada')
                    })
                })
            }
        });

        for await (const chunk of result.fullStream) {
            console.log(chunk);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
