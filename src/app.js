import express from 'express';
//import morgan from 'morgan';
import { serverMessage } from './config';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/products.routes';
import authRouter from './routes/auth.routes';
import corsValidator from './middlewares/corsValidator';
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
// Configuración de CORS
app.use(corsValidator);

//app.use(morgan('dev'));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/admin', authRouter);
app.use('/products', productRoutes);

app.get('/', (req, res) => res.send(serverMessage));

// Este middleware se ejecutará solo si ninguna de las rutas anteriores coincide con la URL solicitada
app.use((req, res) => res.status(404));

export default app;
