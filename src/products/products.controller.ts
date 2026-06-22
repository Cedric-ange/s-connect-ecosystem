import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('catalog')
  async getCatalog(@TenantId() tenantId: string) {
    // Le décorateur extrait et sécurise l'ID, le service s'occupe du reste !
    return this.productsService.getCatalogByTenant(tenantId);
  }
}