import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Administrator role', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['permission-id-1', 'permission-id-2'], required: false })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];
}
