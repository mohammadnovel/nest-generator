import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'blog:create' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Permission to create blog posts', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ example: 'blog' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  @IsNotEmpty()
  action: string;
}
