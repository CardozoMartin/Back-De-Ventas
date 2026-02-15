import { injectable } from "tsyringe";
import { AuditRepository, CreateAuditCommand, AuditDto } from "../repository/Audit.repository";
import { AuditAction, AuditEntity } from "../models/Audit.model";

@injectable()
export class AuditService {
  constructor(private auditRepository: AuditRepository) { }

  async createAudit(command: CreateAuditCommand): Promise<AuditDto> {
    return this.auditRepository.createAudit(command);
  }

  async getAuditById(id: string): Promise<AuditDto | null> {
    return this.auditRepository.getAuditById(id);
  }

  async getAllAudits(): Promise<AuditDto[]> {
    return this.auditRepository.getAllAudits();
  }

  async getAuditsByUser(userId: string): Promise<AuditDto[]> {
    return this.auditRepository.getAuditsByUser(userId);
  }

  async getAuditsByEntity(entity: AuditEntity, entityId?: string): Promise<AuditDto[]> {
    return this.auditRepository.getAuditsByEntity(entity, entityId);
  }

  async getAuditsByAction(action: AuditAction): Promise<AuditDto[]> {
    return this.auditRepository.getAuditsByAction(action);
  }

  async deleteAllAudits(): Promise<void> {
    return this.auditRepository.deleteAllAudits();
  }
}
