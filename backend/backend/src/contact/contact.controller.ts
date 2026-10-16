import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecruitersService } from '../recruiters/recruiters.service';
import { CreateRecruiterDto } from '../recruiters/dto/create-recruiter.dto';
import { CollegesRepository } from '../colleges/colleges.repository';
import { Public } from '../common/decorators/public.decorator';

/** Public landing-page contact operations. */
@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly recruiters: RecruitersService, private readonly colleges: CollegesRepository) {}

  @Get('colleges')
  @Public()
  @ApiOperation({ summary: 'Active colleges a recruiter can contact' })
  listColleges() {
    return this.colleges.findAll().filter((c) => c.status === 'active').map((c) => ({ id: c.id, name: c.name }));
  }

  @Post('recruiter')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Recruiter contact-us form: creates a pending request for the placement cell' })
  submit(@Body() dto: CreateRecruiterDto) {
    const created = this.recruiters.create(dto, 'contact-form');
    return { id: created.id, message: 'Thanks! The placement cell will review your request and email your login once verified.' };
  }
}
