import 'reflect-metadata';
import { Router } from 'express';
import { AuditController } from '../controllers/Audit.controller';
import { container } from 'tsyringe';

const auditRouter = Router();
const auditController = container.resolve(AuditController);

//ruta para crear un registro de auditoría
auditRouter.post('/', auditController.createAudit.bind(auditController));

//ruta para obtener un registro de auditoría por id
auditRouter.get('/:id', auditController.getAuditById.bind(auditController));

//ruta para obtener todos los registros de auditoría
auditRouter.get('/', auditController.getAllAudits.bind(auditController));

//ruta para obtener registros de auditoría por usuario
auditRouter.get('/user/:userId', auditController.getAuditsByUser.bind(auditController));

//ruta para obtener registros de auditoría por entidad y opcionalmente por id de entidad
auditRouter.get('/entity/search', auditController.getAuditsByEntity.bind(auditController));

//ruta para obtener registros de auditoría por acción
auditRouter.get('/action/search', auditController.getAuditsByAction.bind(auditController));

//ruta para eliminar todos los registros de auditoría
auditRouter.delete('/', auditController.deleteAllAudits.bind(auditController));

export default auditRouter;
