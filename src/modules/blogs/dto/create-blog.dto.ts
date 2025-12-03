import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ example: 'Example title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Example content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;

  @ApiProperty({ example: 'category-uuid-here', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
