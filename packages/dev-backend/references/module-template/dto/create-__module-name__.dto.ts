import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class Create__MODULE_NAME_PASCAL__Dto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
