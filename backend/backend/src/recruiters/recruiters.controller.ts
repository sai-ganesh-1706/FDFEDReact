import {
  Controller, Get, Post, Put, Patch, Delete, Param,
  Body, ParseIntPipe, UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';
import { IsOptional, IsString } from 'class-validator';

class DeclineDto { @IsOptional() @IsString() remark?: string; }
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RecruitersService } from './recruiters.service';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Recruiters')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('recruiters')
export class RecruitersController {
  constructor(private readonly service: RecruitersService, private readonly users: UsersRepository) {}

  private name(u: RequestUser) { return this.users.findById(u.userId ?? 0)?.name ?? 'Placement officer'; }

  @Get()
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Get all recruiters (placement_officer only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'pending', 'declined'] })
  @ApiResponse({ status: 200, description: 'List of recruiters' })
  findAll(@CurrentUser() user: RequestUser, @Query('status') status?: string) {
    const college = user.role === 'super_admin' ? null : user.collegeId;
    return status ? this.service.findByStatus(status, college) : this.service.findAll(college);
  }

  @Get('stats')
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Get recruiter statistics (placement_officer only)' })
  getStats(@CurrentUser() user: RequestUser) {
    return this.service.getStats(user.role === 'super_admin' ? null : user.collegeId);
  }

  @Get(':id')
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Get a recruiter by ID (placement_officer only)' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('recruiter', 'placement_officer')
  @ApiOperation({ summary: 'Register a new recruiter' })
  @ApiBody({ type: CreateRecruiterDto })
  @ApiResponse({ status: 201, description: 'Recruiter registered with pending status' })
  create(@Body() dto: CreateRecruiterDto, @CurrentUser() user: RequestUser) {
    return this.service.create({ ...dto, collegeId: user.collegeId ?? dto.collegeId });
  }

  @Put(':id')
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Update a recruiter (placement_officer only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRecruiterDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecruiterDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/approve')
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Approve a pending recruiter (placement_officer only)' })
  @ApiParam({ name: 'id', type: Number })
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.service.approve(id, this.name(user));
  }

  @Patch(':id/decline')
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Decline a recruiter (placement_officer only)' })
  @ApiParam({ name: 'id', type: Number })
  decline(@Param('id', ParseIntPipe) id: number, @Body() body: DeclineDto, @CurrentUser() user: RequestUser) {
    return this.service.decline(id, body?.remark, this.name(user));
  }

  @Delete(':id')
  @Roles('placement_officer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a recruiter (placement_officer only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
