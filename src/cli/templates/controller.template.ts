import { GeneratorOptions, capitalizeFirst, pluralize } from '../generator.utils';

export function generateController(options: GeneratorOptions): string {
  const { name } = options;
  const className = capitalizeFirst(name);
  const pluralName = pluralize(name);
  const pluralClassName = pluralize(className);

  return `import {
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
import { ${pluralClassName}Service } from './${pluralName}.service';
import { Create${className}Dto } from './dto/create-${name}.dto';
import { Update${className}Dto } from './dto/update-${name}.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('${pluralClassName}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('${pluralName}')
export class ${pluralClassName}Controller {
  constructor(private readonly ${pluralName}Service: ${pluralClassName}Service) {}

  @Post()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Create a new ${name}' })
  @ApiResponse({ status: 201, description: '${className} successfully created' })
  create(@Body() create${className}Dto: Create${className}Dto) {
    return this.${pluralName}Service.create(create${className}Dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${pluralName}' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all ${pluralName}' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.${pluralName}Service.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${name} by ID' })
  @ApiResponse({ status: 200, description: 'Return ${name}' })
  @ApiResponse({ status: 404, description: '${className} not found' })
  findOne(@Param('id') id: string) {
    return this.${pluralName}Service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Update ${name}' })
  @ApiResponse({ status: 200, description: '${className} successfully updated' })
  update(@Param('id') id: string, @Body() update${className}Dto: Update${className}Dto) {
    return this.${pluralName}Service.update(id, update${className}Dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete ${name}' })
  @ApiResponse({ status: 200, description: '${className} successfully deleted' })
  remove(@Param('id') id: string) {
    return this.${pluralName}Service.remove(id);
  }
}
`;
}
