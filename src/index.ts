import 'reflect-metadata';
import Aplication,{ Express } from "express";
import { connectDB } from "./config/database";
import dotenv from 'dotenv';
import userRouter from "./routes/User.routes";
import productRouter from "./routes/Product.routes";
import auditRouter from "./routes/Audit.routes";

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

//Rutas
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/audits', auditRouter);

//iniciamos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});