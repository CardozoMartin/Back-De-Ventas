import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
    await mongoose.connect(mongoUri, {
      maxPoolSize: 50, // Conexiones concurrentes máximas
      minPoolSize: 10, // Mantener conexiones calientes listas
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});
