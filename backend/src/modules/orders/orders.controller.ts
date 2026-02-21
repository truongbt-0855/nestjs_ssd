import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseCourseDto, PurchaseCourseResponseDto } from './dto/purchase-course.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('purchase')
  async purchase(
    @CurrentUser('sub') studentId: string,
    @Body() dto: PurchaseCourseDto,
  ): Promise<PurchaseCourseResponseDto> {
    return this.ordersService.purchase(studentId, dto);
  }
}
