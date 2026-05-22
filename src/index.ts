import 'reflect-metadata';
import Aplication,{ Express } from "express";
import { connectDB } from "./config/database";
import dotenv from 'dotenv';
import userRouter from "./routes/User.routes";
import productRouter from "./routes/Product.routes";
import auditRouter from "./routes/Audit.routes";
import saleRouter from "./routes/Sale.routes";
import cashRegisterRouter from "./routes/CashRegister.routes";
import promotionRouter from "./routes/PromotionProducts.routes";
import clientRouter from "./routes/Client.routes";
import cashMovementRouter from "./routes/CashMovement.routes";

dotenv.config();
//creamos la isntancia de la aplicacion
const app: Express = Aplication();
//llamamos la base  de datos
connectDB();

//definimos el puerto
const PORT: number = 3000;

import cors from 'cors';

// ... other imports stay the same ...

//Orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://appstoreventas.netlify.app',
  'https://web.jhservices.com.ar'
];

//configuramos cors con el paquete oficial
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 3600
}));

//middlewares
app.use(Aplication.json());
app.use(Aplication.urlencoded({ extended: true }));

//Rutas
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/audits', auditRouter);
app.use('/api/v1/sales', saleRouter);
app.use('/api/v1/cash-registers', cashRegisterRouter);
app.use('/api/v1/promotions', promotionRouter);
app.use('/api/v1/clients', clientRouter);
app.use('/api/v1/cash-movements', cashMovementRouter);


//iniciamos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});