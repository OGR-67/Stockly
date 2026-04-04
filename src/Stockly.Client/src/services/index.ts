import { MockCategoryService } from "./mock/MockCategoryService"
import { MockProductService } from "./mock/MockProductService"
import { MockStockUnitService } from "./mock/MockStockUnitService"
import { MockStorageLocationService } from "./mock/MockStorageLocationService"

const categoryService = new MockCategoryService()
const locationService = new MockStorageLocationService()
const productService = new MockProductService(categoryService)
const stockUnitService = new MockStockUnitService(productService, locationService)

export { categoryService, locationService, productService, stockUnitService }
