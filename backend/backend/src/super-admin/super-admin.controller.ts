import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { CollegesService } from '../colleges/colleges.service';
import { CreateCollegeDto } from '../colleges/dto/create-college.dto';
import { UpdateCollegeDto } from '../colleges/dto/update-college.dto';
import { CollegeStatusDto } from '../colleges/dto/college-status.dto';
import { CreateCollegeAdminDto } from './dto/create-college-admin.dto';
import { UpdateCollegeAdminDto } from './dto/update-college-admin.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SAMessagesRepository } from './super-admin.messages.repository';
import { ActivityService } from '../activity/activity.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';
import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

class SendMessageDto {
  @IsIn(['one', 'all']) toType: 'one' | 'all';
  @IsOptional() @IsNumber() toCollegeId?: number;
  @IsOptional() @IsString() toCollegeName?: string;
  @IsString() @Length(3, 120, { message: 'Subject must be 3–120 characters' }) subject: string;
  @IsString() @Length(5, 2000, { message: 'Message must be 5–2000 characters' }) message: string;
}

class AdminStatusDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}

@ApiTags('Super Admin')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Roles('super_admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly collegesService: CollegesService,
    private readonly messagesRepo: SAMessagesRepository,
    private readonly activityRepo: ActivityService,
    private readonly usersRepo: UsersRepository,
  ) {}

  private who(u: RequestUser) { return this.usersRepo.findById(u.userId ?? 0)?.name ?? 'Super admin'; }
  private log(u: RequestUser, action: string, detail: string, type: 'college' | 'admin' | 'message', collegeId?: number) {
    this.activityRepo.log({ action, detail, actor: this.who(u), actorRole: 'super_admin', collegeId: collegeId ?? null, type });
  }

  // ── Platform Stats ─────────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Platform-wide statistics (super_admin only)' })
  getStats() {
    return this.superAdminService.getPlatformStats();
  }

  // ── Revenue Model ──────────────────────────────────────────────────────────
  @Get('revenue')
  @ApiOperation({ summary: 'Revenue model — MRR, ARR, tier breakdown, drive fees (super_admin only)' })
  getRevenue() {
    return this.superAdminService.getRevenueStats();
  }

  // ── Colleges ───────────────────────────────────────────────────────────────
  @Get('colleges')
  @ApiOperation({ summary: 'All colleges with admin info and per-college stats (super_admin only)' })
  getAllColleges() {
    return this.superAdminService.getAllCollegesWithAdmins();
  }

  @Post('colleges')
  @ApiOperation({ summary: 'Create a new college (super_admin only)' })
  @ApiBody({ type: CreateCollegeDto })
  @ApiResponse({ status: 201 })
  createCollege(@Body() dto: CreateCollegeDto, @CurrentUser() u: RequestUser) {
    const created = this.collegesService.create(dto);
    this.log(u, 'College Created', `${created.name} (${created.code}) was registered on the platform`, 'college', created.id);
    return created;
  }

  @Get('colleges/:id')
  @ApiOperation({ summary: 'Single college with admin + stats (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  getCollege(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getCollegeWithAdmin(id);
  }

  @Put('colleges/:id')
  @ApiOperation({ summary: 'Update college details (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCollegeDto })
  updateCollege(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCollegeDto, @CurrentUser() u: RequestUser) {
    const updated = this.collegesService.update(id, dto);
    this.log(u, 'College Updated', `${updated.name} details were updated`, 'college', id);
    return updated;
  }

  @Patch('colleges/:id/status')
  @ApiOperation({ summary: 'Update college status (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CollegeStatusDto })
  updateCollegeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: CollegeStatusDto, @CurrentUser() u: RequestUser) {
    const updated = this.collegesService.updateStatus(id, dto.status);
    this.log(u, 'College Status Updated', `${updated.name} status set to ${dto.status}`, 'college', id);
    return updated;
  }

  @Patch('colleges/:id/subscription')
  @ApiOperation({ summary: 'Change college subscription tier — basic | standard | premium (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  updateCollegeSubscription(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { tier: 'basic' | 'standard' | 'premium' },
  ) {
    return this.superAdminService.changeSubscriptionTier(id, dto.tier);
  }

  @Delete('colleges/:id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a college (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  deleteCollege(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: RequestUser) {
    const name = this.collegesService.findOne(id).name;
    const result = this.collegesService.remove(id);
    this.log(u, 'College Deleted', `${name} was removed from the platform`, 'college');
    return result;
  }

  // ── College Admins ─────────────────────────────────────────────────────────
  @Get('colleges/:id/admin')
  @ApiOperation({ summary: 'Get the college admin for a college (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  getCollegeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getCollegeAdmin(id);
  }

  @Post('colleges/:id/admin')
  @ApiOperation({ summary: 'Create/assign a college admin (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateCollegeAdminDto })
  @ApiResponse({ status: 201 })
  createCollegeAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCollegeAdminDto, @CurrentUser() u: RequestUser) {
    const admin = this.superAdminService.createCollegeAdmin(id, dto);
    this.log(u, 'College Admin Assigned', `${admin.name} assigned as admin for ${this.collegesService.findOne(id).name}`, 'admin', id);
    return admin;
  }

  @Put('colleges/:id/admin')
  @ApiOperation({ summary: 'Update college admin details (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCollegeAdminDto })
  updateCollegeAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCollegeAdminDto) {
    return this.superAdminService.updateCollegeAdmin(id, dto);
  }

  @Patch('colleges/:id/admin/status')
  @ApiOperation({ summary: 'Activate/deactivate college admin (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AdminStatusDto })
  toggleCollegeAdminStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminStatusDto, @CurrentUser() u: RequestUser) {
    const admin = this.superAdminService.toggleCollegeAdminStatus(id, dto.status);
    this.log(u, 'Admin Status Updated', `${admin.name} (${this.collegesService.findOne(id).name}) set to ${dto.status}`, 'admin', id);
    return admin;
  }

  // ── College Users ──────────────────────────────────────────────────────────
  @Get('colleges/:id/users')
  @ApiOperation({ summary: 'Get all users of a specific college (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  getCollegeUsers(@Param('id', ParseIntPipe) id: number) {
    return this.superAdminService.getCollegeUsers(id);
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  @Get('messages')
  @ApiOperation({ summary: 'Get all messages sent by super admin' })
  getMessages() {
    return this.messagesRepo.findAll();
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message to one or all college admins (super_admin only)' })
  @ApiBody({ schema: { example: { toType: 'one', toCollegeId: 1, toCollegeName: 'IIIT Sri City', subject: 'Hello', message: 'Test message' } } })
  sendMessage(@Body() body: SendMessageDto, @CurrentUser() u: RequestUser) {
    if (body.toType === 'one') {
      if (!body.toCollegeId) throw new BadRequestException('Choose a college to message');
      body.toCollegeName = this.collegesService.findOne(body.toCollegeId).name;
    }
    const msg = this.messagesRepo.create(body);
    this.log(u, 'Message Sent',
      body.toType === 'all' ? `Broadcast to all college admins: "${body.subject}"` : `Message to ${body.toCollegeName}: "${body.subject}"`,
      'message', body.toCollegeId);
    return msg;
  }

  /** What a college admin sees in their Messages page. */
  @Get('inbox')
  @Roles('college_admin')
  @ApiOperation({ summary: 'Messages from the super admin addressed to this college (college_admin)' })
  inbox(@CurrentUser() u: RequestUser) {
    return this.messagesRepo.findForCollege(u.collegeId);
  }

  // ── Activity Log ───────────────────────────────────────────────────────────
  @Get('activity')
  @ApiOperation({ summary: 'Get platform activity log (super_admin only)' })
  getActivity() {
    return this.activityRepo.findAll();
  }
}
