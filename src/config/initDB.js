import { pool } from './db.js';

export const initDB = async () => {
    // 1. Guardamos todo el SQL dentro de una variable de texto (usando backticks ` `)
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS parqueadero_registro (
            id_registro SERIAL PRIMARY KEY,
            placa VARCHAR(10) NOT NULL,
            tipo_vehiculo VARCHAR(20) NOT NULL,
            hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            hora_salida TIMESTAMP,
            estado VARCHAR(20) DEFAULT 'ACTIVO', 
            total_pagar NUMERIC(12, 2) DEFAULT 0,
            metodo_pago VARCHAR(50),
            id_usuario_ingreso INTEGER
        );
    `;

    // 2. Le pedimos a Node que envíe ese texto a Postgres
    try {
        await pool.query(createTableQuery);
        console.log('✅ Tabla "parqueadero_registro" lista y verificada.');
    } catch (error) {
        console.error('❌ Error al crear la tabla:', error.message);
    }
};