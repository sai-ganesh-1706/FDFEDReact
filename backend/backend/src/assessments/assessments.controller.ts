import {
  Controller, Get, Post, Put, Delete, Param,
  Body, ParseIntPipe, UseGuards, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { UsersRepository } from '../users/users.repository';

@ApiTags('Assessments')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(
    private readonly service: AssessmentsService,
    private readonly oppsService: OpportunitiesService,
    private readonly usersRepo: UsersRepository,
  ) {}

  private ownedOpportunityIds(userId: number): Set<number> {
    const company = this.usersRepo.findById(userId)?.company;
    return new Set(this.oppsService.findForRecruiter(userId, company).map((o) => o.id));
  }

  private appsOwned(userId: number, applicationId: number): boolean {
    const company = this.usersRepo.findById(userId)?.company;
    const owned = this.ownedOpportunityIds(userId);
    try { return owned.has(this.service['appsService'].findOne(applicationId).opportunityId); } catch { return false; }
  }

  /** Recruiters may only change assessments they created or that sit under their opportunities. */
  private assertCanManage(id: number, user: RequestUser) {
    if (user.role !== 'recruiter') return;
    const userId = user.userId ?? 0;
    const mine = this.service.findForRecruiter(userId, this.ownedOpportunityIds(userId));
    if (!mine.some((a) => a.id === id)) {
      throw new ForbiddenException('You can only manage your own assessments');
    }
  }

  @Get()
  @Roles('recruiter', 'placement_officer')
  @ApiOperation({ summary: 'Get all assessments (recruiter / placement_officer)' })
  @ApiResponse({ status: 200, description: 'List of assessments' })
  findAll(@CurrentUser() user: RequestUser) {
    if (user.role === 'placement_officer') return this.service.findForCollege(user.collegeId ?? 1);
    const userId = user.userId ?? 0;
    return this.service.findForRecruiter(userId, this.ownedOpportunityIds(userId));
  }

  @Get('my')
  @Roles('candidate')
  @ApiOperation({ summary: 'Assessments and interviews scheduled for the signed-in candidate' })
  findMine(@CurrentUser() user: RequestUser) {
    return this.service.findForCandidate(user.userId ?? 0);
  }

  @Get(':id')
  @Roles('recruiter', 'placement_officer')
  @ApiOperation({ summary: 'Get a single assessment by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('recruiter')
  @ApiOperation({ summary: 'Create a new assessment (recruiter only)' })
  @ApiBody({ type: CreateAssessmentDto })
  @ApiResponse({ status: 201, description: 'Assessment created' })
  create(@Body() dto: CreateAssessmentDto, @CurrentUser() user: RequestUser) {
    if (dto.applicationId) {
      const mine = this.appsOwned(user.userId ?? 0, dto.applicationId);
      if (!mine) throw new ForbiddenException('You can only schedule for applications to your own opportunities');
    }
    return this.service.create(dto, user.userId ?? undefined);
  }

  @Put(':id')
  @Roles('recruiter')
  @ApiOperation({ summary: 'Update an assessment (recruiter only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateAssessmentDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssessmentDto, @CurrentUser() user: RequestUser) {
    this.assertCanManage(id, user);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('recruiter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an assessment (recruiter only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    this.assertCanManage(id, user);
    return this.service.remove(id);
  }
}
