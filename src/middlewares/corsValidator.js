import cors from 'cors';

const allowedOrigins = ['gasper1one'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso no permitido'));
    }
  },
};

export default cors(corsOptions);
