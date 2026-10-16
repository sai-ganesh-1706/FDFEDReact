import { Injectable } from '@nestjs/common';

export interface SAMessage {
  id: number;
  toType: 'one' | 'all';
  toCollegeId?: number;
  toCollegeName?: string;
  subject: string;
  message: string;
  sentAt: string;
}

@Injectable()
export class SAMessagesRepository {
  private messages: SAMessage[] = [];
  private nextId = 1;

  findAll(): SAMessage[] {
    return [...this.messages].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  /** Messages a college admin should see: broadcasts plus ones addressed to their college. */
  findForCollege(collegeId: number | null): SAMessage[] {
    return this.findAll().filter((m) => m.toType === 'all' || (collegeId != null && m.toCollegeId === collegeId));
  }

  create(data: Omit<SAMessage, 'id' | 'sentAt'>): SAMessage {
    const msg: SAMessage = { id: this.nextId++, ...data, sentAt: new Date().toISOString() };
    this.messages.push(msg);
    return msg;
  }
}
