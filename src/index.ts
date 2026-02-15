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

dotenv.config();
//creamos la isntancia de la aplicacion
const app: Express = Aplication();
//llamamos la base  de datos
connectDB();

//definimos el puerto
const PORT: number = 3000;

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

//middlewares
app.use(Aplication.json());
app.use(Aplication.urlencoded({ extended: true }));

//configuramos los cors mejorado
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Permitir origen específico si está en la lista de permitidos
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Permitir sin origin (requests desde mismo origen o sin browser)
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

//Rutas
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/audits', auditRouter);
app.use('/api/v1/sales', saleRouter);
app.use('/api/v1/cash-registers', cashRegisterRouter);
app.use('/api/v1/promotions', promotionRouter);


//iniciamos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});