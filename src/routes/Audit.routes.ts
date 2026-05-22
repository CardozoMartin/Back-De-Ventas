import 'reflect-metadata';
import { Router } from 'express';
import { AuditController } from '../controllers/Audit.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { requireRole } from '../middlewares/RoleAuthorization';

const auditRouter = Router();
const auditController = container.resolve(AuditController);

//ruta para crear un registro de auditoría (protegido)
auditRouter.post('/', verifyToken, auditController.createAudit.bind(auditController));

//ruta para obtener todos los registros de auditoría (solo admin)
auditRouter.get('/', verifyToken, requireRole('admin'), auditController.getAllAudits.bind(auditController));

//ruta para obtener registros de auditoría por usuario (solo admin)
auditRouter.get('/user/:userId', verifyToken, requireRole('admin'), auditController.getAuditsByUser.bind(auditController));

//ruta para obtener registros de auditoría por entidad y opcionalmente por id de entidad (solo admin)
auditRouter.get('/entity/search', verifyToken, requireRole('admin'), auditController.getAuditsByEntity.bind(auditController));

//ruta para obtener registros de auditoría por acción (solo admin)
auditRouter.get('/action/search', verifyToken, requireRole('admin'), auditController.getAuditsByAction.bind(auditController));

//ruta para obtener un registro de auditoría por id (solo admin)
auditRouter.get('/:id', verifyToken, requireRole('admin'), auditController.getAuditById.bind(auditController));

//ruta para eliminar todos los registros de auditoría (solo admin)
auditRouter.delete('/', verifyToken, requireRole('admin'), auditController.deleteAllAudits.bind(auditController));

export default auditRouter;
