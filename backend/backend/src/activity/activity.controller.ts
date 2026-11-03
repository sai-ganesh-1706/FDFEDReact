import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/guards/roles.guard';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get('placement-officers')
  @Roles('college_admin')
  placementOfficers(@CurrentUser() user: RequestUser) {
    if (!user.collegeId)
      throw new ForbiddenException('A college account is required');
    return this.activity
      .findAll()
      .filter(
        (entry) =>
          entry.collegeId === user.collegeId &&
          entry.actorRole === 'placement_officer',
      );
  }
}
