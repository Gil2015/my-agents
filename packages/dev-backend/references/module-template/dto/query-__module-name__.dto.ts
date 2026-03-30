import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class Query__MODULE_NAME_PASCAL__Dto {
  @IsInt()
  @Min(1)
  pageNo: number;

  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
