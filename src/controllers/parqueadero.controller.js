import { pool } from '../config/db.js';

const calcularTotalAPagar = (tipo, minutos) => {
    const horas = Math.ceil(minutos / 60); 

    if (tipo === 'CARRO') {
        if (horas > 6 && horas <= 12) return 20000; 
        if (horas > 4 && horas <= 6) return 15000;  
        return horas * 3500; 
    }

    if (tipo === 'MOTO') {
        if (horas > 6 && horas <= 12) return 9000;  
        if (horas > 4 && horas <= 6) return 6000;  
        return horas * 1500; 
    }
    return 0;
};

export const registrarIngreso = async (req, res) => {
    const { placa, tipo_vehiculo } = req.body; 
    const maxCarros = parseInt(process.env.MAX_CARROS);
    const maxMotos = parseInt(process.env.MAX_MOTOS);

    try {
        const countRes = await pool.query(
            'SELECT COUNT(*) FROM parqueadero_registro WHERE tipo_vehiculo = $1 AND estado = $2',
            [tipo_vehiculo.toUpperCase(), 'ACTIVO']
        );
        
        const ocupados = parseInt(countRes.rows[0].count);
        const limite = tipo_vehiculo.toUpperCase() === 'CARRO' ? maxCarros : maxMotos;

        if (ocupados >= limite) {
            return res.status(400).json({ error: `Sin cupos. Hay ${ocupados} ${tipo_vehiculo}s dentro.` });
        }

        const insertRes = await pool.query(
            `INSERT INTO parqueadero_registro (placa, tipo_vehiculo, hora_entrada, estado) 
             VALUES ($1, $2, CURRENT_TIMESTAMP, 'ACTIVO') RETURNING *`,
            [placa.toUpperCase(), tipo_vehiculo.toUpperCase()]
        );

        res.status(201).json({
            message: 'Ingreso registrado',
            cupos_restantes: limite - (ocupados + 1),
            registro: insertRes.rows[0] 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar entrada' });
    }
};

// 🚀 NUEVO: Simula la pistola leyendo el código de barras
export const calcularSalida = async (req, res) => {
    const { id } = req.params;

    try {
        const registro = await pool.query(
            'SELECT * FROM parqueadero_registro WHERE id_registro = $1 AND estado = $2',
            [id, 'ACTIVO']
        );

        if (registro.rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado o ya pagó' });
        }

        const vehiculo = registro.rows[0];
        const horaEntrada = new Date(vehiculo.hora_entrada);
        const horaSalida = new Date();
        
        // Calcular diferencia en minutos (mínimo cobramos 1 minuto)
        const diffMs = horaSalida - horaEntrada;
        const diffMinutos = Math.max(1, Math.ceil(diffMs / (1000 * 60))); 

        const total = calcularTotalAPagar(vehiculo.tipo_vehiculo, diffMinutos);

        res.json({
            id_registro: vehiculo.id_registro,
            placa: vehiculo.placa,
            tipo: vehiculo.tipo_vehiculo,
            tiempo_transcurrido_minutos: diffMinutos,
            total_pagar: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular salida' });
    }
};

// 🚀 NUEVO: Cierra la orden cuando el cliente paga
export const finalizarServicio = async (req, res) => {
    const { id, metodo_pago, total_pagar } = req.body;

    try {
        await pool.query(
            `UPDATE parqueadero_registro 
             SET hora_salida = CURRENT_TIMESTAMP, 
                 total_pagar = $1, 
                 metodo_pago = $2, 
                 estado = 'FINALIZADO' 
             WHERE id_registro = $3`,
            [total_pagar, metodo_pago, id]
        );

        res.json({ message: 'Pago registrado y cupo liberado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar pago' });
    }
};
// 🚀 NUEVO: Ver disponibilidad en tiempo real para la pantalla principal
export const getDisponibilidad = async (req, res) => {
    const maxCarros = parseInt(process.env.MAX_CARROS);
    const maxMotos = parseInt(process.env.MAX_MOTOS);

    try {
        const query = `
            SELECT tipo_vehiculo, COUNT(*) as ocupados 
            FROM parqueadero_registro 
            WHERE estado = 'ACTIVO' 
            GROUP BY tipo_vehiculo
        `;
        const result = await pool.query(query);
        
        const disponibilidad = { 
            CARRO: { ocupados: 0, disponibles: maxCarros, totales: maxCarros }, 
            MOTO: { ocupados: 0, disponibles: maxMotos, totales: maxMotos } 
        };

        result.rows.forEach(row => {
            const tipo = row.tipo_vehiculo;
            if (disponibilidad[tipo]) {
                disponibilidad[tipo].ocupados = parseInt(row.ocupados);
                disponibilidad[tipo].disponibles -= parseInt(row.ocupados);
            }
        });

        res.json(disponibilidad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar cupos' });
    }
};