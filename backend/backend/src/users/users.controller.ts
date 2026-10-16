import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseIntPipe, UseGuards, HttpCode, HttpStatus, Headers, Req, ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity,
  ApiResponse, ApiQuery, ApiHeader, ApiConsumes,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/guards/roles.guard';
import { ActivityService } from '../activity/activity.service';
import { CollegesRepository } from '../colleges/colleges.repository';
import { Public } from '../common/decorators/public.decorator';
import { AuthSessionService } from '../common/auth/auth-session.service';

/** Which roles each administrator may create / manage. */
const MANAGEABLE: Record<string, string[]> = {
  placement_officer: ['candidate', 'alumni', 'recruiter'],
  college_admin: ['placement_officer'],
};

/** Minimal DTO for login */
class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

/** DTO for password change */
class ChangePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(3) newPassword: string;
}

@ApiTags('Users')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activity: ActivityService,
    private readonly colleges: CollegesRepository,
    private readonly sessions: AuthSessionService,
  ) {}

  /** Throws unless the caller may change this user (themselves, or someone in their remit). */
  private assertCanManage(caller: RequestUser, targetId: number) {
    if (caller.role === 'super_admin') return;
    if (caller.userId === targetId) return;
    const target = this.usersService.findRaw(targetId);
    if (!target) return; // the service answers 404
    const allowed = MANAGEABLE[caller.role] ?? [];
    if (!allowed.includes(target.role) || target.collegeId !== caller.collegeId) {
      throw new ForbiddenException('You are not allowed to change this account');
    }
  }

  @Get()
  @Roles('placement_officer', 'college_admin', 'super_admin')
  @ApiOperation({
    summary:
      'Get users — super_admin: all users; college_admin/placement_officer: scoped to their college',
  })
  @ApiHeader({ name: 'x-role', required: true })
  @ApiHeader({ name: 'x-college-id', required: false, description: 'Required for college_admin / placement_officer' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  findAll(
    @Headers('x-role') role: string,
    @Headers('x-college-id') collegeIdHeader: string,
    @Query('role') roleFilter?: string,
  ) {
    // super_admin sees everything
    if (role === 'super_admin') {
      return roleFilter ? this.usersService.findByRole(roleFilter) : this.usersService.findAll();
    }
    // college_admin and placement_officer are scoped to their college
    const collegeId =
      collegeIdHeader && collegeIdHeader !== 'null' && collegeIdHeader !== ''
        ? +collegeIdHeader
        : null;
    if (collegeId) {
      return roleFilter
        ? this.usersService.findByRoleAndCollege(roleFilter, collegeId)
        : this.usersService.findByCollege(collegeId);
    }
    // fallback if no collegeId header
    return roleFilter ? this.usersService.findByRole(roleFilter) : this.usersService.findAll();
  }

  /** Alumni of the caller's college — used by the referral and mentorship screens. */
  @Get('alumni-directory')
  @Roles('candidate', 'alumni', 'placement_officer', 'college_admin')
  @ApiOperation({ summary: 'Alumni of the caller\'s college (public profile fields only)' })
  alumniDirectory(@Headers('x-college-id') collegeIdHeader: string) {
    const collegeId =
      collegeIdHeader && collegeIdHeader !== 'null' && collegeIdHeader !== '' ? +collegeIdHeader : null;
    const alumni = collegeId
      ? this.usersService.findByRoleAndCollege('alumni', collegeId)
      : this.usersService.findByRole('alumni');
    return alumni
      .filter((a) => a.status !== 'inactive')
      .map(({ id, name, company, batch, headline, avatar, avatarColor, location, department, referrals }) => ({
        id, name, company, batch, headline, avatar, avatarColor, location, department, referrals,
      }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /** ── Login (public — no role required) ──────────────────────── */
  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Validate credentials and return user info for role-based redirect',
    description: 'Returns user object including `collegeId` (null for super_admin). Store in localStorage.',
  })
  @ApiBody({ schema: { example: { email: 'c@gmail.com', password: '123' } } })
  @ApiResponse({ status: 200, description: 'Login successful — returns user without password (includes collegeId)' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() body: LoginDto) {
    const user = this.usersService.login(body.email, body.password);
    if (user.role !== 'super_admin') {
      this.activity.log({
        action: 'Signed In', detail: `${user.name} signed in as ${user.role.replace('_', ' ')}`,
        actor: user.name, actorRole: user.role, collegeId: user.collegeId ?? null, type: 'login',
      });
    }
    return { ...user, accessToken: this.sessions.create(user.id) };
  }

  /** Change own password (current password must match) */
  @Post(':id/password')
  @ApiOperation({ summary: 'Change a user password (requires the current password)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { example: { currentPassword: '123', newPassword: 'newSecret1' } } })
  @ApiResponse({ status: 201, description: 'Password updated' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  changePassword(@Param('id', ParseIntPipe) id: number, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(id, body.currentPassword, body.newPassword);
  }

  @Post()
  @Roles('placement_officer', 'college_admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  create(@Body() dto: CreateUserDto, @CurrentUser() caller: RequestUser) {
    let collegeId = dto.collegeId;
    if (caller.role !== 'super_admin') {
      if (!(MANAGEABLE[caller.role] ?? []).includes(dto.role)) {
        throw new ForbiddenException(`A ${caller.role.replace('_', ' ')} cannot create ${dto.role.replace('_', ' ')} accounts`);
      }
      collegeId = caller.collegeId ?? undefined;   // always the caller's own college
    }
    const created = this.usersService.create({ ...dto, collegeId });
    const college = created.collegeId ? this.colleges.findById(created.collegeId)?.name : undefined;
    this.activity.log({
      action: 'User Added',
      detail: `${created.name} was added as ${created.role.replace('_', ' ')}${college ? ` at ${college}` : ''}`,
      actor: this.usersService.findRaw(caller.userId ?? 0)?.name ?? caller.role,
      actorRole: caller.role, collegeId: created.collegeId ?? null, type: 'user',
    });
    return created;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @CurrentUser() caller: RequestUser) {
    this.assertCanManage(caller, id);
    // Nobody can promote, move or re-credential themselves through the profile form.
    if (caller.role !== 'super_admin' && caller.userId === id) {
      delete (dto as any).role; delete (dto as any).collegeId; delete (dto as any).status; delete (dto as any).password;
    }
    const before = this.usersService.findRaw(id);
    const updated = this.usersService.update(id, dto);
    if (before && dto.status && dto.status !== before.status) {
      this.activity.log({
        action: dto.status === 'active' ? 'Account Activated' : 'Account Deactivated',
        detail: `${updated.name} (${updated.role.replace('_', ' ')}) was ${dto.status === 'active' ? 'activated' : 'set to ' + dto.status}`,
        actor: this.usersService.findRaw(caller.userId ?? 0)?.name ?? caller.role,
        actorRole: caller.role, collegeId: updated.collegeId ?? null, type: 'user',
      });
    }
    return updated;
  }

  @Delete(':id')
  @Roles('placement_officer', 'college_admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User deleted' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() caller: RequestUser) {
    this.assertCanManage(caller, id);
    const target = this.usersService.findRaw(id);
    const result = this.usersService.remove(id);
    if (target) {
      this.activity.log({
        action: 'User Removed', detail: `${target.name} (${target.role.replace('_', ' ')}) was removed`,
        actor: this.usersService.findRaw(caller.userId ?? 0)?.name ?? caller.role,
        actorRole: caller.role, collegeId: target.collegeId ?? null, type: 'user',
      });
    }
    return result;
  }

  /**
   * POST /users/:id/profile-picture
   * Upload a profile picture for a user.
   *
   * The file is handled by FileUploadMiddleware (multer) applied at the
   * router level via AppModule.configure(). The processed file is available
   * as req.file after the middleware runs.
   */
  @Post(':id/profile-picture')
  @ApiOperation({ summary: 'Upload a profile picture for a user (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture (jpeg / png / gif, max 5 MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Profile picture uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeded' })
  uploadProfilePicture(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return { statusCode: 400, message: 'No file uploaded. Send a file with field name "file".' };
    }
    return {
      statusCode: 201,
      message: 'Profile picture uploaded successfully',
      userId: id,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: `/uploads/${file.filename}`,
    };
  }
}

