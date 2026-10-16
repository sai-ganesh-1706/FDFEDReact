import {
  Controller, Get, Post, Delete, Body, Param,
  ParseIntPipe, UseGuards, HttpCode, HttpStatus, Headers, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiBody, ApiParam, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AnnouncementsRepository } from './announcements.repository';
import { UsersRepository } from '../users/users.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';

@ApiTags('Announcements')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly repo: AnnouncementsRepository,
    private readonly users: UsersRepository,
    private readonly notifications: NotificationsService,
    private readonly activity: ActivityService,
  ) {}

  @Get()
  @Roles('college_admin', 'placement_officer', 'candidate')
  @ApiOperation({ summary: 'Get announcements for the college admin\'s college' })
  @ApiHeader({ name: 'x-college-id', required: true })
  findAll(@Headers('x-college-id') collegeIdHeader: string) {
    const collegeId = collegeIdHeader ? +collegeIdHeader : null;
    if (!collegeId) return [];
    return this.repo.findByCollege(collegeId);
  }

  @Post()
  @Roles('college_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Post a new announcement for this college' })
  @ApiHeader({ name: 'x-college-id', required: true })
  @ApiBody({ schema: { example: { type: 'general', title: 'Hello', message: 'Body text', author: 'Dr. Name' } } })
  @ApiResponse({ status: 201 })
  create(
    @Headers('x-college-id') collegeIdHeader: string,
    @Body() body: { type: string; title: string; message: string; author?: string },
  ) {
    const collegeId = collegeIdHeader ? +collegeIdHeader : null;
    if (!collegeId) return { error: 'Missing x-college-id header' };
    if (!body.title?.trim() || !body.message?.trim()) throw new BadRequestException('Title and message are required');
    const author = body.author ?? 'College Admin';
    const created = this.repo.create({
      collegeId,
      type: (body.type as any) || 'general',
      title: body.title.trim(),
      message: body.message.trim(),
      author,
    });
    // Placement officers of this college get it in their bell as well as on their dashboard.
    this.users.findByRoleAndCollege('placement_officer', collegeId)
      .filter((u) => u.status !== 'inactive')
      .forEach((u) => this.notifications.create({ type: 'general', title: `Announcement: ${created.title}`, message: created.message, href: '#', isRead: false }, u.id));
    this.activity.log({ action: 'Announcement Posted', detail: `"${created.title}" posted for the college`, actor: author, actorRole: 'college_admin', collegeId, type: 'notification' });
    return created;
  }

  @Delete(':id')
  @Roles('college_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an announcement (must belong to this college)' })
  @ApiHeader({ name: 'x-college-id', required: true })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-college-id') collegeIdHeader: string,
  ) {
    const collegeId = collegeIdHeader ? +collegeIdHeader : null;
    if (!collegeId) return { error: 'Missing x-college-id header' };
    const deleted = this.repo.delete(id, collegeId);
    if (!deleted) throw new NotFoundException(`Announcement ${id} not found for this college`);
    return { success: true };
  }
}
