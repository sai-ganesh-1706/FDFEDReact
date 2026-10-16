import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  ParseIntPipe, UseGuards, Headers, HttpCode, HttpStatus, Query, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ShortlistCandidatesDto } from './dto/shortlist-candidates.dto';
import { BulkStatusDto } from './dto/bulk-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Applications')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  @Roles('recruiter', 'placement_officer', 'college_admin')
  @ApiOperation({ summary: 'Get all applications (recruiter / placement_officer / college_admin)' })
  @ApiQuery({ name: 'opportunityId', required: false, type: Number, description: 'Filter by opportunity ID' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  findAll(@CurrentUser() user: RequestUser, @Query('opportunityId') opportunityId?: string) {
    const all = user.role === 'recruiter'
      ? this.service.findForRecruiter(user.userId ?? 0)
      : this.service.findAll(user.role === 'super_admin' ? null : user.collegeId);
    return opportunityId ? all.filter((a) => a.opportunityId === +opportunityId) : all;
  }

  @Get('my')
  @Roles('candidate')
  @ApiOperation({ summary: 'Get my applications (candidate) — candidateId=1 by default' })
  @ApiQuery({ name: 'candidateId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Candidate applications' })
  findMine(@CurrentUser() user: RequestUser) {
    return this.service.findByCandidate(user.userId ?? 0);
  }

  @Get('stats')
  @Roles('candidate')
  @ApiOperation({ summary: 'Get application statistics for a candidate' })
  @ApiQuery({ name: 'candidateId', required: false, type: Number })
  getStats(@CurrentUser() user: RequestUser) {
    return this.service.getStats(user.userId ?? 0);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single application by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    const app = this.service.findOne(id);
    if (user.role === 'candidate' && app.candidateId !== user.userId) throw new ForbiddenException('Not your application');
    if (user.role === 'recruiter' && !this.service.ownsApplication(app, user.userId ?? 0)) throw new ForbiddenException('Not your opportunity');
    return app;
  }

  @Post()
  @Roles('candidate')
  @ApiOperation({ summary: 'Apply to an opportunity (candidate only)' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  @ApiResponse({ status: 409, description: 'Already applied' })
  apply(@Body() dto: CreateApplicationDto, @CurrentUser() user: RequestUser) {
    return this.service.apply(dto, user.userId ?? 0, user.collegeId ?? undefined);
  }

  @Post('shortlist')
  @Roles('recruiter')
  @ApiOperation({ summary: 'Shortlist candidates for an opportunity (creates the application if needed)' })
  @ApiBody({ type: ShortlistCandidatesDto })
  shortlist(@Body() dto: ShortlistCandidatesDto, @CurrentUser() user: RequestUser) {
    return this.service.shortlist(dto, user.userId ?? 0);
  }

  @Post('bulk-status')
  @Roles('recruiter')
  @ApiOperation({ summary: 'Shortlist or reject several applied applications at once (recruiter)' })
  @ApiBody({ type: BulkStatusDto })
  bulkStatus(@Body() dto: BulkStatusDto, @CurrentUser() user: RequestUser) {
    return this.service.bulkStatus(dto, user.userId ?? 0);
  }

  @Patch(':id/status')
  @Roles('recruiter', 'placement_officer')
  @ApiOperation({ summary: 'Update application status (recruiter / placement_officer)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateApplicationDto })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateApplicationDto, @CurrentUser() user: RequestUser) {
    if (user.role === 'recruiter' && !this.service.ownsApplication(this.service.findOne(id), user.userId ?? 0)) {
      throw new ForbiddenException('You can only update applications for your own opportunities');
    }
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/withdraw')
  @Roles('candidate')
  @ApiOperation({ summary: 'Withdraw an application (candidate only)' })
  @ApiParam({ name: 'id', type: Number })
  withdraw(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: RequestUser) {
    return this.service.withdraw(id, user.userId ?? 0);
  }

  @Delete(':id')
  @Roles('placement_officer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an application (placement_officer only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
