import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository, User } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type SafeUser = Omit<User, 'password'>;

/** Never let a password leave the API. */
function toSafe(user: User): SafeUser {
  const { password: _omit, ...safe } = user;
  return safe;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findAll(): SafeUser[] {
    return this.repo.findAll().map(toSafe);
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
    if (this.repo.findByEmail(dto.email)) {
      throw new ConflictException(`A user with email '${dto.email}' already exists`);
    }
    const initials = dto.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const data = { status: 'active', avatar: initials, ...dto, password: dto.password ?? '123' };
    return toSafe(this.repo.create(data as Omit<User, 'id'>));
  }

  /** Raw lookups used by controllers for permission checks. */
  findRaw(id: number): User | undefined {
    return this.repo.findById(id);
  }

  update(id: number, dto: UpdateUserDto): SafeUser {
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
    const user = this.repo.findByEmail(email);
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
