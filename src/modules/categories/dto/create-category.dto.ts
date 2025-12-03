import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Example name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Example description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
