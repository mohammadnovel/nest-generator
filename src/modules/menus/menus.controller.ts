import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiResponse({ status: 201, description: 'Menu successfully created' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all menus' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.menusService.findAll(+page, +limit);
  }

  @Get('hierarchy/tree')
  @ApiOperation({ summary: 'Get menu hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Return menu hierarchy' })
  findHierarchy() {
    return this.menusService.findHierarchy();
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get menus by role ID' })
  @ApiResponse({ status: 200, description: 'Return menus accessible by role' })
  findByRole(@Param('roleId') roleId: string) {
    return this.menusService.findByRole(roleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiResponse({ status: 200, description: 'Return menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Update menu' })
  @ApiResponse({ status: 200, description: 'Menu successfully updated' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete menu' })
  @ApiResponse({ status: 200, description: 'Menu successfully deleted' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
