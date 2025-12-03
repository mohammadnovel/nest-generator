import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const { roleIds, ...menuData } = createMenuDto;
    
    const menu = this.menuRepository.create(menuData);

    if (roleIds && roleIds.length > 0) {
      menu.roles = await this.roleRepository.findBy({ id: In(roleIds) });
    }

    return await this.menuRepository.save(menu);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.menuRepository.findAndCount({
      relations: ['roles', 'parent'],
      skip: (page - 1) * limit,
      take: limit,
      order: { order: 'ASC', name: 'ASC' },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByRole(roleId: string): Promise<Menu[]> {
    return await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.roles', 'role')
      .leftJoinAndSelect('menu.parent', 'parent')
      .where('role.id = :roleId', { roleId })
      .andWhere('menu.isActive = :isActive', { isActive: true })
      .orderBy('menu.order', 'ASC')
      .getMany();
  }

  async findHierarchy(): Promise<Menu[]> {
    const allMenus = await this.menuRepository.find({
      relations: ['roles', 'parent'],
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    // Build tree structure
    const menuMap = new Map<string, Menu & { children: Menu[] }>();
    const rootMenus: (Menu & { children: Menu[] })[] = [];

    // Initialize all menus with children array
    allMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Build hierarchy
    allMenus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.id)!;
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuWithChildren);
        }
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    return rootMenus;
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['roles', 'parent'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    const { roleIds, ...menuData } = updateMenuDto;

    Object.assign(menu, menuData);

    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        menu.roles = await this.roleRepository.findBy({ id: In(roleIds) });
      } else {
        menu.roles = [];
      }
    }

    return await this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.softRemove(menu);
  }
}
