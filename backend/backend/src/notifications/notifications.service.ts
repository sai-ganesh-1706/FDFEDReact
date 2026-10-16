import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationsRepository, Notification } from './notifications.repository';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly repo: NotificationsRepository) {}

  findByCandidate(candidateId: number): Notification[] {
    return this.repo.findByCandidate(candidateId);
  }

  findOne(id: number): Notification {
    const n = this.repo.findById(id);
    if (!n) throw new NotFoundException(`Notification ${id} not found`);
    return n;
  }

  create(dto: CreateNotificationDto, candidateId: number): Notification {
    const now = new Date().toISOString().split('T')[0];
    return this.repo.create({ ...dto, candidateId, isRead: dto.isRead ?? false, createdAt: now });
  }

  markRead(id: number, userId?: number): Notification {
    const existing = this.repo.findById(id);
    if (existing && userId && existing.candidateId !== userId) throw new ForbiddenException('Not your notification');
    const updated = this.repo.update(id, { isRead: true });
    if (!updated) throw new NotFoundException(`Notification ${id} not found`);
    return updated;
  }

  markAllRead(candidateId: number): { message: string } {
    this.repo.markAllRead(candidateId);
    return { message: 'All notifications marked as read' };
  }

  update(id: number, dto: UpdateNotificationDto): Notification {
    const updated = this.repo.update(id, dto as Partial<Notification>);
    if (!updated) throw new NotFoundException(`Notification ${id} not found`);
    return updated;
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Notification ${id} not found`);
    return { message: `Notification ${id} deleted` };
  }

  getUnreadCount(candidateId: number): { count: number } {
    const count = this.repo.findByCandidate(candidateId).filter((n) => !n.isRead).length;
    return { count };
  }
}
