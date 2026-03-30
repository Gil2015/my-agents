import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('__TABLE_NAME__')
export class __MODULE_NAME_PASCAL__Entity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '名称' })
  name: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0=禁用 1=启用' })
  status: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', comment: '软删除时间' })
  deletedAt: Date | null;
}
