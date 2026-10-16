import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { CollegeStatusDto } from './dto/college-status.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Colleges')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('colleges')
export class CollegesController {
  constructor(private readonly service: CollegesService) {}

  @Get()
  @Roles('super_admin', 'college_admin', 'placement_officer')
  @ApiOperation({ summary: 'Get all colleges' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('super_admin', 'college_admin', 'placement_officer', 'candidate', 'recruiter', 'alumni')
  @ApiOperation({ summary: 'Get a college by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * Returns the college's subscription tier, pricing, allowed features, and locked features.
   * All actor roles can call this — each actor dashboard uses it to render plan badge + locks.
   * The college subscription belongs to the college, not the individual actor.
   */
  @Get(':id/subscription')
  @Roles('super_admin', 'college_admin', 'placement_officer', 'candidate', 'recruiter', 'alumni')
  @ApiOperation({ summary: 'Subscription plan + feature matrix for a college (all roles)' })
  @ApiParam({ name: 'id', type: Number })
  getSubscription(@Param('id', ParseIntPipe) id: number) {
    return this.service.getSubscription(id);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a new college (super_admin only)' })
  @ApiBody({ type: CreateCollegeDto })
  @ApiResponse({ status: 201, description: 'College created' })
  create(@Body() dto: CreateCollegeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update a college (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCollegeDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCollegeDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update college status — active | inactive | suspended (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CollegeStatusDto })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: CollegeStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a college (super_admin only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
