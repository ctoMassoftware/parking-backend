import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Verificamos que la conexión sea exitosa
pool.on('connect', () => {
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error fatal en la base de datos:', err.message);
});