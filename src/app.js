import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import parqueaderoRoutes from './routes/parqueadero.routes.js'; // 👈 1. Importa la ruta

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/parqueadero', parqueaderoRoutes); // 👈 2. Usa la ruta

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

export default app;