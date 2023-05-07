import express from 'express';
import cors from 'cors';
//import morgan from 'morgan';
import { serverMessage } from './config';
import outputHandler from './middlewares/outputHandler';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/products.routes';
import authRouter from './routes/auth.routes';

const app = express();
//app.use(morgan('dev'));
app.use(express.json());

app.use(express.static('public'));

app.use('/user', userRoutes);
app.use('/admin', authRouter);
app.use('/products', productRoutes);

app.get('/', (req, res) => res.send(serverMessage));

// Este middleware se ejecutará solo si ninguna de las rutas anteriores coincide con la URL solicitada
app.use((req, res) => res.send(outputHandler(404, 'Error')));
app.use(
  cors({
    origin: ['https://gas-app-mauve.vercel.app'], // Especifica los orígenes permitidos para las solicitudes
  }),
);
export default app;
