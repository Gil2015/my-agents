import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { __MODULE_NAME_PASCAL__Controller } from "./__MODULE_NAME__.controller";
import { __MODULE_NAME_PASCAL__Service } from "./__MODULE_NAME__.service";
import { __MODULE_NAME_PASCAL__Entity } from "./entities/__MODULE_NAME__.entity";

@Module({
  imports: [TypeOrmModule.forFeature([__MODULE_NAME_PASCAL__Entity])],
  controllers: [__MODULE_NAME_PASCAL__Controller],
  providers: [__MODULE_NAME_PASCAL__Service],
  exports: [__MODULE_NAME_PASCAL__Service],
})
export class __MODULE_NAME_PASCAL__Module {}
