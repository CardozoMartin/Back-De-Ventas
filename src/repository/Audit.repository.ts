import { IAudit, Audit, AuditAction, AuditEntity } from '../models/Audit.model';
import { injectable } from 'tsyringe';
import { Types } from 'mongoose';

export interface CreateAuditCommand {
  user: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  description?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ip?: string;
}

export interface AuditDto {
  id: string;
  user: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  description?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ip?: string;
  createdAt: Date;
}

interface IAuditRepository {
  createAudit(command: CreateAuditCommand): Promise<AuditDto>;
  getAuditById(id: string): Promise<AuditDto | null>;
  getAllAudits(): Promise<AuditDto[]>;
  getAuditsByUser(userId: string): Promise<AuditDto[]>;
  getAuditsByEntity(entity: AuditEntity, entityId?: string): Promise<AuditDto[]>;
  getAuditsByAction(action: AuditAction): Promise<AuditDto[]>;
  deleteAllAudits(): Promise<void>;
}

@injectable()
export class AuditRepository implements IAuditRepository {
  async createAudit(command: CreateAuditCommand): Promise<AuditDto> {
    const audit = new Audit({
      user: new Types.ObjectId(command.user),
      action: command.action,
      entity: command.entity,
      entityId: command.entityId ? new Types.ObjectId(command.entityId) : undefined,
      description: command.description,
      changes: command.changes,
      ip: command.ip,
    });
    await audit.save();
    return this.toDto(audit);
  }

  async getAuditById(id: string): Promise<AuditDto | null> {
    const audit = await Audit.findById(id).populate('user', 'name email');
    return audit ? this.toDto(audit) : null;
  }

  async getAllAudits(): Promise<AuditDto[]> {
    const audits = await Audit.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return audits.map(audit => this.toDto(audit));
  }

  async getAuditsByUser(userId: string): Promise<AuditDto[]> {
    const audits = await Audit.find({ user: new Types.ObjectId(userId) })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return audits.map(audit => this.toDto(audit));
  }

  async getAuditsByEntity(entity: AuditEntity, entityId?: string): Promise<AuditDto[]> {
    const query: Record<string, unknown> = { entity };
    if (entityId) {
      query.entityId = new Types.ObjectId(entityId);
    }
    const audits = await Audit.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return audits.map(audit => this.toDto(audit));
  }

  async getAuditsByAction(action: AuditAction): Promise<AuditDto[]> {
    const audits = await Audit.find({ action })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return audits.map(audit => this.toDto(audit));
  }

  async deleteAllAudits(): Promise<void> {
    await Audit.deleteMany({});
  }

  private toDto(audit: any): AuditDto {
    const userId = audit.user && typeof audit.user === 'object' && audit.user._id 
      ? audit.user._id.toString() 
      : audit.user?.toString();
      
    return {
      id: audit._id.toString(),
      user: userId,
      action: audit.action,
      entity: audit.entity,
      entityId: audit.entityId?.toString(),
      description: audit.description,
      changes: audit.changes,
      ip: audit.ip,
      createdAt: audit.createdAt,
    };
  }
}
