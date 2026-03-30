import { __MODULE_NAME_PASCAL__Entity } from '../entities/__MODULE_NAME__.entity';

export class __MODULE_NAME_PASCAL__Vo {
  id: number;
  name: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: __MODULE_NAME_PASCAL__Entity): __MODULE_NAME_PASCAL__Vo {
    const vo = new __MODULE_NAME_PASCAL__Vo();
    vo.id = entity.id;
    vo.name = entity.name;
    vo.status = entity.status;
    vo.createdAt = entity.createdAt;
    vo.updatedAt = entity.updatedAt;
    return vo;
  }
}
