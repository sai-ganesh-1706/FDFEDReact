import {
  Controller, Get, Post, Patch, Delete, Param,
  Body, ParseIntPipe, UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiSecurity, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Roles('candidate', 'alumni', 'recruiter', 'placement_officer', 'college_admin')
  @ApiOperation({ summary: 'Get all notifications for the signed-in candidate or alumni' })
  @ApiQuery({ name: 'candidateId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Candidate notifications' })
  findAll(@CurrentUser() user: RequestUser) {
    return this.service.findByCandidate(user.userId ?? 0);
  }

  @Get('unread-count')
  @Roles('candidate', 'alumni', 'recruiter', 'placement_officer', 'college_admin')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiQuery({ name: 'candidateId', required: false, type: Number })
  getUnreadCount(@CurrentUser() user: RequestUser) {
    return this.service.getUnreadCount(user.userId ?? 0);
  }

  @Post()
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Create a notification (placement_officer only)' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiQuery({ name: 'candidateId', required: false, type: Number })
  create(@Body() dto: CreateNotificationDto, @Query('candidateId') candidateId?: string) {
    return this.service.create(dto, candidateId ? +candidateId : 1);
  }

  @Patch('read-all')
  @Roles('candidate', 'alumni', 'recruiter', 'placement_officer', 'college_admin')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiQuery({ name: 'candidateId', required: false, type: Number })
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.service.markAllRead(user.userId ?? 0);
  }

  @Patch(':id/read')
  @Roles('candidate', 'alumni', 'recruiter', 'placement_officer', 'college_admin')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', type: Number })
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.service.markRead(id, user.userId ?? 0);
  }

  @Patch(':id')
  @Roles('candidate')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotificationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('candidate', 'placement_officer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
