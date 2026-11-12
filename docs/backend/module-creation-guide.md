# Module Creation Guide

This guide details the process of adding new modules to the API, ensuring all code adheres to our [Documentation Standards](./documentation-standards.md) and [Naming Standards](./naming.md).

## 1. Generation Step

Use the NestJS CLI to generate the resource. This creates the module, controller, service, dto, and entity.

```bash
# Example: Creating a 'products' resource
nest g resource modules/products
```

-   **Transport layer**: Select `REST API`.
-   **CRUD entry points**: Select `Y` (Yes) to generate boilerplate.

## 2. Controller Template ("The Gold Standard")

After generation, immediately add Swagger decorators.

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'; // [!] Import Swagger
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@/entities/product.entity';

@ApiTags('Products') // [!] Required: Grouping
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' }) // [!] Required
  @ApiResponse({ status: 201, description: 'Product created successfully.', type: Product }) // [!] Required
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all products' })
  @ApiResponse({ status: 200, description: 'List of products.', type: [Product] })
  findAll() {
    return this.productsService.findAll();
  }
}
```

## 3. DTO Template

Ensure all properties have `@ApiProperty`.

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'Name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ example: 29.99, description: 'Price in USD' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 'Electronics', description: 'Product category' })
  @IsOptional()
  @IsString()
  category?: string;
}
```

## 4. HTTP Client Examples

```http
### Login (Establish Session)
# @name adminLogin
POST {{API_BASE_URL}}/auth/login
Content-Type: application/json

{
    "email": "{{TEST_USERNAME}}",
    "password": "{{TEST_USER_PASSWORD}}"
}

### List Resources
GET {{API_BASE_URL}}/products
Content-Type: application/json

### Create Resource
POST {{API_BASE_URL}}/products
Content-Type: application/json

{
    "name": "New Product"
}
```

## 5. Service Template

Ensure complex logic is documented with JSDoc (Compodoc).

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '@/entities/product.entity';

/**
 * Manages product catalog operations.
 */
@Injectable()
export class ProductsService {
  
  /**
   * Creates a new product record.
   * 
   * @param createProductDto - The product data
   * @returns The created Product entity
   */
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  /**
   * soft-deletes a product.
   * 
   * @param id - Product ID
   * @throws {NotFoundException} If product not found
   */
  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
```
