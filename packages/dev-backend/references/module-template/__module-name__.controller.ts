import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { __MODULE_NAME_PASCAL__Service } from './__MODULE_NAME__.service';
import { Create__MODULE_NAME_PASCAL__Dto } from './dto/create-__MODULE_NAME__.dto';
import { Update__MODULE_NAME_PASCAL__Dto } from './dto/update-__MODULE_NAME__.dto';
import { Query__MODULE_NAME_PASCAL__Dto } from './dto/query-__MODULE_NAME__.dto';

@ApiTags('__MODULE_DISPLAY_NAME__')
@Controller('__MODULE_NAME__')
export class __MODULE_NAME_PASCAL__Controller {
  constructor(
    private readonly __MODULE_NAME_CAMEL__Service: __MODULE_NAME_PASCAL__Service,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建__MODULE_DISPLAY_NAME__' })
  async create(@Body() dto: Create__MODULE_NAME_PASCAL__Dto) {
    return this.__MODULE_NAME_CAMEL__Service.create(dto);
  }

  @Post('list')
  @ApiOperation({ summary: '查询__MODULE_DISPLAY_NAME__列表' })
  async queryList(@Body() dto: Query__MODULE_NAME_PASCAL__Dto) {
    return this.__MODULE_NAME_CAMEL__Service.queryList(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询__MODULE_DISPLAY_NAME__详情' })
  async findOne(@Param('id') id: number) {
    return this.__MODULE_NAME_CAMEL__Service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新__MODULE_DISPLAY_NAME__' })
  async update(
    @Param('id') id: number,
    @Body() dto: Update__MODULE_NAME_PASCAL__Dto,
  ) {
    return this.__MODULE_NAME_CAMEL__Service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除__MODULE_DISPLAY_NAME__' })
  async remove(@Param('id') id: number) {
    return this.__MODULE_NAME_CAMEL__Service.remove(id);
  }
}
