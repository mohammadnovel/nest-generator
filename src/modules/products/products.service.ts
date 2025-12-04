import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);



    const saved = await this.productRepository.save(product);
    
    // Invalidate cache
    await this.cacheManager.del('products:all');
    
    return saved;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Product[]; total: number; page: number; lastPage: number }> {
    const cacheKey = `products:page:${page}:limit:${limit}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as { data: Product[]; total: number; page: number; lastPage: number };
    }

    // Fetch from database
    const [data, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const result = {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };

    // Store in cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `products:id:${id}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as Product;
    }

    // Fetch from database
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Store in cache for 10 minutes (600 seconds)
    await this.cacheManager.set(cacheKey, product, 600);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);



    const updated = await this.productRepository.save(product);
    
    // Invalidate cache
    await this.cacheManager.del(`products:id:${id}`);
    await this.cacheManager.del('products:all');
    
    return updated;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
    
    // Invalidate cache
    await this.cacheManager.del(`products:id:${id}`);
    await this.cacheManager.del('products:all');
  }
}
