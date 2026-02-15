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

//middlewares
app.use(Aplication.json());
app.use(Aplication.urlencoded({ extended: true }));
//configuramos los cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
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