import 'dotenv/config'; 
import app from './app.js';
import { pool } from './config/db.js';
import { initDB } from './config/initDB.js'; // 👈 OJO AQUÍ: Debes importar la función

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a la base de datos PostgreSQL');

        // 👈 OJO AQUÍ: Debes ejecutar la función antes de prender el servidor
        await initDB(); 

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error fatal al conectar con PostgreSQL:', error.message);
    }
};

startServer();