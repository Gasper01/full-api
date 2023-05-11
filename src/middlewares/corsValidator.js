import cors from 'cors';

const allowedOrigins = ['http://localhost:3000', 'https://cib-web.vercel.app'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback("Error server");
    }
  },
  credentials: true
};

export default cors(corsOptions);
