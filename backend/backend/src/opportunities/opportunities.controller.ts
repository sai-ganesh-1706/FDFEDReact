import {
  Controller, Get, Post, Put, Patch, Delete, Param,
  Body, ParseIntPipe, UseGuards, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersRepository } from '../users/users.repository';
import { Roles } from '../common/decorators/roles.decorator';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RejectDto {
  @ApiProperty({ example: 'Does not meet eligibility criteria' })
  @IsString()
  remark!: string;
}

@ApiTags('Opportunities')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly service: OpportunitiesService,
    private readonly usersRepo: UsersRepository,
  ) {}

  /** Recruiters may only change opportunities they own. */
  private assertCanManage(id: number, user: RequestUser) {
    if (user.role !== 'recruiter') return;
    const opp = this.service.findOne(id);
    const me = user.userId ? this.usersRepo.findById(user.userId) : undefined;
    if (!this.service.owns(opp, user.userId ?? 0, me?.company)) {
      throw new ForbiddenException('You can only manage your own opportunities');
    }
  }

  private actor(user: RequestUser) {
    return { name: this.usersRepo.findById(user.userId ?? 0)?.name ?? 'Placement officer' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities (published for candidates, all for others)' })
  @ApiHeader({ name: 'x-role', description: 'User role', required: true })
  @ApiResponse({ status: 200, description: 'List of opportunities' })
  findAll(@CurrentUser() user: RequestUser) {
    if (user.role === 'candidate' || user.role === 'alumni') {
      return this.service.findPublished(user.collegeId);
    }
    if (user.role === 'recruiter') {
      const me = user.userId ? this.usersRepo.findById(user.userId) : undefined;
      return this.service.findForRecruiter(user.userId ?? 0, me?.company);
    }
    // Placement officers and college admins only see their own college's opportunities.
    return this.service.findAll(user.role === 'super_admin' ? null : user.collegeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single opportunity by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('recruiter', 'placement_officer')
  @ApiOperation({ summary: 'Post a new opportunity (recruiter / placement_officer)' })
  @ApiBody({ type: CreateOpportunityDto })
  @ApiResponse({ status: 201, description: 'Opportunity created with status pending' })
  create(@Body() dto: CreateOpportunityDto, @CurrentUser() user: RequestUser) {
    return this.service.create(dto, user.userId ?? undefined, user.role, user.collegeId);
  }

  @Put(':id')
  @Roles('recruiter')
  @ApiOperation({ summary: 'Update an opportunity (recruiter only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOpportunityDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOpportunityDto, @CurrentUser() user: RequestUser) {
    this.assertCanManage(id, user);
    // Only the placement cell moves an opportunity through review; a recruiter edit never changes its status.
    delete (dto as any).status;
    return this.service.update(id, dto);
  }

  @Patch(':id/approve')
  @Roles('placement_officer')
  @ApiOperation({
    summary: 'Approve a pending opportunity (placement_officer only)',
    description: 'Marks a pending opportunity submission as **approved** (reviewed and accepted). ' +
      'After approval, the placement officer can publish it to make it live for candidates via `PATCH /opportunities/:id/publish`.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Opportunity ID to approve' })
  @ApiResponse({ status: 200, description: 'Opportunity status set to approved' })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.service.approve(id, this.actor(user));
  }

  @Patch(':id/undo-approval')
  @Roles('placement_officer')
  @ApiOperation({
    summary: 'Return an approved, unpublished opportunity to pending review (placement_officer only)',
    description: 'Available only after approval and before publication. The opportunity returns to pending review and is never visible to candidates.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Opportunity ID whose approval should be undone' })
  undoApproval(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.service.undoApproval(id, this.actor(user));
  }

  @Patch(':id/publish')
  @Roles('placement_officer')
  @ApiOperation({
    summary: 'Publish an approved opportunity to candidates (placement_officer only)',
    description:
      'Makes an approved opportunity **live** so that candidates can view and apply. ' +
      'This is the final step in the review workflow: `pending → approved → Published`. ' +
      'Only opportunities with status `approved` can be published.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Opportunity ID to publish' })
  @ApiResponse({ status: 200, description: 'Opportunity status set to Published and is now live for candidates' })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  publish(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.service.publish(id, this.actor(user));
  }

  @Patch(':id/reject')
  @Roles('placement_officer')
  @ApiOperation({ summary: 'Reject an opportunity (placement_officer only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: RejectDto })
  reject(@Param('id', ParseIntPipe) id: number, @Body() body: RejectDto, @CurrentUser() user: RequestUser) {
    return this.service.reject(id, body.remark, this.actor(user));
  }

  @Delete(':id')
  @Roles('recruiter', 'placement_officer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an opportunity' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    this.assertCanManage(id, user);
    return this.service.remove(id);
  }
}
