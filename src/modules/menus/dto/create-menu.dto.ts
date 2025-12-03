import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Dashboard' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Main dashboard page', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '/dashboard' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ example: 'dashboard', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 'parent-menu-id', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: ['role-id-1', 'role-id-2'], required: false, description: 'Role IDs that can access this menu' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
