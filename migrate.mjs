import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_CN5EwO0fikIs@ep-ancient-fog-ac8ur6cr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require');

async function setup() {
    // Tabla de turnos / reservas
    await sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id          SERIAL PRIMARY KEY,
      paciente    VARCHAR(200) NOT NULL,
      especialidad VARCHAR(100) NOT NULL,
      fecha_hora  TIMESTAMP WITH TIME ZONE NOT NULL,
      contacto    VARCHAR(200),
      estado      VARCHAR(20) DEFAULT 'confirmado' 
                    CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
      notas       TEXT,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
    console.log('✅ tabla appointments creada/verificada');

    // Índice para búsqueda rápida de disponibilidad
    await sql`
    CREATE INDEX IF NOT EXISTS idx_appointments_esp_fecha 
    ON appointments (especialidad, fecha_hora) 
    WHERE estado != 'cancelado'
  `;
    console.log('✅ índice creado');

    // Verificar
    const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    ORDER BY ordinal_position
  `;
    console.log('\n📋 Esquema final:');
    cols.forEach(r => console.log(`   ${r.column_name.padEnd(15)} ${r.data_type}`));

    // Test insert
    const test = await sql`
    INSERT INTO appointments (paciente, especialidad, fecha_hora, contacto, estado)
    VALUES ('TEST BORRAR', 'Test', NOW(), '000', 'pendiente')
    RETURNING id
  `;
    console.log('\n✅ insert test OK, id:', test[0].id);

    await sql`DELETE FROM appointments WHERE paciente = 'TEST BORRAR'`;
    console.log('✅ cleanup OK');
}

setup().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
