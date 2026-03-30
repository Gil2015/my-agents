import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { __MODULE_NAME_PASCAL__Entity } from './entities/__MODULE_NAME__.entity';
import { Create__MODULE_NAME_PASCAL__Dto } from './dto/create-__MODULE_NAME__.dto';
import { Update__MODULE_NAME_PASCAL__Dto } from './dto/update-__MODULE_NAME__.dto';
import { Query__MODULE_NAME_PASCAL__Dto } from './dto/query-__MODULE_NAME__.dto';
import { __MODULE_NAME_PASCAL__Vo } from './vo/__MODULE_NAME__.vo';

@Injectable()
export class __MODULE_NAME_PASCAL__Service {
  constructor(
    @InjectRepository(__MODULE_NAME_PASCAL__Entity)
    private readonly __MODULE_NAME_CAMEL__Repository: Repository<__MODULE_NAME_PASCAL__Entity>,
  ) {}

  async create(dto: Create__MODULE_NAME_PASCAL__Dto): Promise<__MODULE_NAME_PASCAL__Vo> {
    const entity = this.__MODULE_NAME_CAMEL__Repository.create(dto);
    const saved = await this.__MODULE_NAME_CAMEL__Repository.save(entity);
    return __MODULE_NAME_PASCAL__Vo.fromEntity(saved);
  }

  async queryList(dto: Query__MODULE_NAME_PASCAL__Dto) {
    const { pageNo, pageSize, ...filters } = dto;
    const [list, total] = await this.__MODULE_NAME_CAMEL__Repository.findAndCount({
      where: { ...filters },
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      total,
      list: list.map((item) => __MODULE_NAME_PASCAL__Vo.fromEntity(item)),
    };
  }

  async findOne(id: number): Promise<__MODULE_NAME_PASCAL__Vo> {
    const entity = await this.__MODULE_NAME_CAMEL__Repository.findOne({
      where: { id },
    });
    if (!entity) {
      // TODO: 替换为项目统一的业务异常
      throw new Error('记录不存在');
    }
    return __MODULE_NAME_PASCAL__Vo.fromEntity(entity);
  }

  async update(
    id: number,
    dto: Update__MODULE_NAME_PASCAL__Dto,
  ): Promise<__MODULE_NAME_PASCAL__Vo> {
    await this.__MODULE_NAME_CAMEL__Repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.__MODULE_NAME_CAMEL__Repository.softDelete(id);
  }
}
