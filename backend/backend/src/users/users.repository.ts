import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_INITIAL_PASSWORD } from '../common/auth/password-policy';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  oversightVisible?: boolean;
  collegeId?: number | null;
  password?: string;          // default portal credential for newly created users
  department?: string;
  cgpa?: number;
  rollNumber?: string;
  backlogs?: number;
  company?: string;
  batch?: string;
  batchLabel?: string;
  headline?: string;
  location?: string;
  university?: string;
  phone?: string;
  about?: string;
  avatar?: string;
  avatarColor?: string;
  status?: string;
  referrals?: number;
  skills?: string[];
  socialLinks?: { github?: string; linkedin?: string; portfolio?: string };
  resumeData?: Record<string, any>;
}


@Injectable()
export class UsersRepository {
  /** Set on construction so request guards can check account status without extra DI wiring. */
  static current: UsersRepository | null = null;
  constructor() {
    UsersRepository.current = this;
    const baseUsers: User[] = JSON.parse(readFileSync(join(process.cwd(), 'data', 'users.base.demo.json'), 'utf8'));
    const demoUsers: User[] = JSON.parse(readFileSync(join(process.cwd(), 'data', 'users.demo.json'), 'utf8'));
    if (!Array.isArray(baseUsers) || !Array.isArray(demoUsers)) throw new Error('Invalid demo users file');
    const usersById = new Map<number, User>();
    for (const user of baseUsers) usersById.set(user.id, { ...user });
    // The focused workflow accounts override older same-ID profiles so logins,
    // applications, referrals, and ownership all resolve to one account.
    for (const user of demoUsers) usersById.set(user.id, { ...usersById.get(user.id), ...user });
    this.users = [...usersById.values()];
    // Legacy fixtures support historical workflows. The small JSON demo set
    // and new runtime accounts populate the current User Oversight directory.
    this.users.filter((u) => ['candidate', 'alumni'].includes(u.role)).forEach((u) => { u.oversightVisible = false; });
    for (const user of demoUsers) this.update(user.id, { ...user, oversightVisible: true });
    const ids = new Set<number>();
    const emails = new Set<string>();
    for (const user of this.users) {
      if (!Number.isInteger(user.id) || ids.has(user.id)) throw new Error(`Duplicate or invalid user ID: ${user.id}`);
      const email = user.email.trim().toLowerCase();
      if (!email || emails.has(email)) throw new Error(`Duplicate or missing user email: ${user.email}`);
      if (!['candidate', 'alumni', 'recruiter', 'placement_officer', 'college_admin', 'super_admin'].includes(user.role)) throw new Error(`Invalid user role for ${user.email}`);
      ids.add(user.id);
      emails.add(email);
    }
    this.nextId = Math.max(this.nextId, ...this.users.map((u) => u.id + 1));
  }

  private users: User[] = [];

  private nextId = 236;

  findAll(): User[] {
    // Every current directory and dashboard uses the same population.
    // Archived fixtures remain addressable by ID for historical records.
    return this.users.filter((u) => u.oversightVisible !== false);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findByRole(role: string): User[] {
    return this.findAll().filter(u => u.role === role);
  }

  findByCollegeId(collegeId: number): User[] {
    return this.findAll().filter(u => u.collegeId === collegeId);
  }

  findByRoleAndCollege(role: string, collegeId: number): User[] {
    return this.findAll().filter(u => u.role === role && u.collegeId === collegeId);
  }

  create(data: Omit<User, 'id'>): User {
    const user: User = {
      id: this.nextId++,
      password: DEFAULT_INITIAL_PASSWORD,
      ...data,
      oversightVisible: true,
    };
    this.users.push(user);
    return user;
  }

  update(id: number, data: Partial<User>): User | undefined {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...data };
    return this.users[idx];
  }

  remove(id: number): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}
