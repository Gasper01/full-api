import express from 'express';
//import morgan from 'morgan';
import { serverMessage } from './config';
import outputHandler from './middlewares/outputHandler';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/products.routes';
import authRouter from './routes/auth.routes';
import corsValidator from './middlewares/corsValidator';
const app = express();
// Configuración de CORS
app.use(corsValidator);

//app.use(morgan('dev'));
app.use(express.json());

app.use(express.static('public'));

app.use('/user', userRoutes);
app.use('/admin', authRouter);
app.use('/products', productRoutes);

app.get('/', (req, res) => res.send(serverMessage));

// Este middleware se ejecutará solo si ninguna de las rutas anteriores coincide con la URL solicitada
app.use((req, res) => res.send(outputHandler(404, 'Error')));

export default app;
