import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository, User } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { parseStudentCsv } from './student-csv';
import { validateOversightUser } from './oversight-validation';
import { CollegesRepository } from '../colleges/colleges.repository';
import { oversightPolicy } from './oversight-policy';

export type SafeUser = Omit<User, 'password'>;

/** Never let a password leave the API. */
function toSafe(user: User): SafeUser {
  const { password: _omit, ...safe } = user;
  return safe;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository, private readonly colleges: CollegesRepository) {}

  getOversightPolicy(collegeId: number) {
    const college = this.colleges.findById(collegeId);
    if (!college) throw new BadRequestException('A valid college is required');
    return oversightPolicy(college);
  }

  importStudents(csv: string, collegeId: number, dryRun = true) {
    return this.importOversight(csv, collegeId, 'candidate', dryRun);
  }

  importAlumni(csv: string, collegeId: number, dryRun = true) {
    return this.importOversight(csv, collegeId, 'alumni', dryRun);
  }

  private importOversight(csv: string, collegeId: number, role: 'candidate' | 'alumni', dryRun: boolean) {
    const records = parseStudentCsv(csv);
    if (records.length < 2) throw new BadRequestException('CSV must include a header and at least one user');
    const required = role === 'candidate' ? ['name', 'email', 'rollnumber', 'department', 'cgpa', 'backlogs'] : ['name', 'email', 'company', 'batch', 'referrals'];
    const allowed = [...required, 'phone', ...(role === 'alumni' ? ['department', 'headline', 'location'] : [])];
    const headers = records[0].cells.map((value) => value.toLowerCase().replace(/[ _]/g, ''));
    if (new Set(headers).size !== headers.length || headers.some((h) => !allowed.includes(h)) || required.some((h) => !headers.includes(h))) {
      throw new BadRequestException(`Required headers: ${required.join(',')}. Download the ${role === 'candidate' ? 'student' : 'alumni'} template.`);
    }
    const emails = new Set(this.repo.findAll().map((u) => u.email.toLowerCase()));
    const rolls = new Set(this.repo.findByCollegeId(collegeId).filter((u) => u.rollNumber).map((u) => u.rollNumber!.toUpperCase()));
    const errors: { row: number; messages: string[] }[] = [];
    const students: CreateUserDto[] = [];
    for (const record of records.slice(1)) {
      const values = Object.fromEntries(headers.map((h, i) => [h, record.cells[i] ?? '']));
      const rowErrors: string[] = [];
      const email = values.email.toLowerCase();
      const roll = values.rollnumber?.toUpperCase();
      if (record.cells.length !== headers.length) rowErrors.push('Number of columns does not match the header');
      if (required.some((h) => !values[h])) rowErrors.push('All required columns must have a value');
      if (emails.has(email)) rowErrors.push('Email already exists or is repeated in this file');
      if (roll && rolls.has(roll)) rowErrors.push('Roll number already exists in this college or is repeated in this file');
      const student: CreateUserDto = { name: values.name, email, ...(values.phone ? { phone: values.phone } : {}), role, collegeId, status: 'active', password: '12345678', ...(role === 'candidate' ? { rollNumber: roll, department: values.department, cgpa: Number(values.cgpa), backlogs: Number(values.backlogs) } : { company: values.company, batch: values.batch, referrals: Number(values.referrals), ...(values.department ? { department: values.department } : {}), ...(values.headline ? { headline: values.headline } : {}), ...(values.location ? { location: values.location } : {}) }) };
      rowErrors.push(...validateOversightUser(student, this.getOversightPolicy(collegeId)));
      emails.add(email); if (roll) rolls.add(roll);
      if (rowErrors.length) errors.push({ row: record.row, messages: rowErrors });
      students.push(student);
    }
    if (errors.length) return { valid: false, total: students.length, imported: 0, errors, preview: [] };
    if (!dryRun) students.forEach((student) => this.create(student));
    return { valid: true, total: students.length, imported: dryRun ? 0 : students.length, errors: [], preview: students.slice(0, 10).map(({ password, ...student }) => student) };
  }

  findAll(): SafeUser[] {
    return this.repo.findAll().map(toSafe);
  }

  findOversight(collegeId: number): SafeUser[] {
    return this.repo.findByCollegeId(collegeId)
      .filter((u) => ['candidate', 'alumni'].includes(u.role) && u.oversightVisible !== false)
      .map(toSafe)
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }) || a.email.localeCompare(b.email));
  }

  findOne(id: number): SafeUser {
    const user = this.repo.findById(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return toSafe(user);
  }

  findByRole(role: string): SafeUser[] {
    return this.repo.findByRole(role).map(toSafe);
  }

  findByCollege(collegeId: number): SafeUser[] {
    return this.repo.findByCollegeId(collegeId).map(toSafe);
  }

  findByRoleAndCollege(role: string, collegeId: number): SafeUser[] {
    return this.repo.findByRoleAndCollege(role, collegeId).map(toSafe);
  }

  create(dto: CreateUserDto): SafeUser {
    dto = { ...dto, name: dto.name.trim(), email: dto.email.trim().toLowerCase() };
    if (['candidate', 'alumni'].includes(dto.role)) {
      const errors = validateOversightUser(dto, this.getOversightPolicy(dto.collegeId ?? 1));
      if (errors.length) throw new BadRequestException(errors);
      if (dto.role === 'candidate') {
        dto.rollNumber = dto.rollNumber!.trim().toUpperCase();
        dto.department = dto.department!.trim();
        if (this.repo.findByCollegeId(dto.collegeId ?? 1).some((u) => u.rollNumber?.toUpperCase() === dto.rollNumber)) throw new ConflictException('Roll number already exists in this college');
      } else { dto.company = dto.company!.trim(); dto.batch = dto.batch!.trim(); }
    }
    if (this.repo.findByEmail(dto.email)) {
      throw new ConflictException(`A user with email '${dto.email}' already exists`);
    }
    const initials = dto.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const data = { status: 'active', avatar: initials, ...dto, password: dto.password ?? (['candidate', 'alumni'].includes(dto.role) ? '12345678' : '123') };
    return toSafe(this.repo.create(data as Omit<User, 'id'>));
  }

  /** Raw lookups used by controllers for permission checks. */
  findRaw(id: number): User | undefined {
    return this.repo.findById(id);
  }

  update(id: number, dto: UpdateUserDto): SafeUser {
    const current = this.repo.findById(id);
    if (!current) throw new NotFoundException(`User with id ${id} not found`);
    if (dto.email !== undefined) {
      dto.email = dto.email.trim().toLowerCase();
      const existing = this.repo.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictException('Email already belongs to another account');
    }
    if (['candidate', 'alumni'].includes(current.role)) {
      const errors = validateOversightUser({ ...current, ...dto, role: current.role } as CreateUserDto, this.getOversightPolicy(current.collegeId ?? 1));
      if (errors.length) throw new BadRequestException(errors);
    }
    const updated = this.repo.update(id, dto as Partial<User>);
    if (!updated) throw new NotFoundException(`User with id ${id} not found`);
    return toSafe(updated);
  }

  changePassword(id: number, currentPassword: string, newPassword: string): { message: string } {
    const user = this.repo.findById(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    if ((user.password ?? '123') !== currentPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    this.repo.update(id, { password: newPassword });
    return { message: 'Password updated successfully' };
  }

  login(email: string, password: string): SafeUser {
    const user = this.repo.findByEmail(email.trim().toLowerCase());
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const pwd = user.password ?? '123';   // existing mock users have no password → default '123'
    if (pwd !== password) throw new UnauthorizedException('Invalid email or password');
    // A deactivated account must not be able to sign in, whoever deactivated it.
    if (user.status === 'inactive' || user.status === 'suspended') {
      throw new UnauthorizedException('Your account has been deactivated. Please contact your administrator.');
    }
    // Never return the password field to the client
    return toSafe(user);
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`User with id ${id} not found`);
    return { message: `User ${id} deleted successfully` };
  }
}
