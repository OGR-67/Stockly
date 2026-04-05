import { MockCategoryService } from "./mock/MockCategoryService"
import { MockProductService } from "./mock/MockProductService"
import { MockStockUnitService } from "./mock/MockStockUnitService"
import { MockStorageLocationService } from "./mock/MockStorageLocationService"
import { MockPrinterService } from "./mock/MockPrinterService"

const categoryService = new MockCategoryService()
const locationService = new MockStorageLocationService()
const productService = new MockProductService(categoryService)
const stockUnitService = new MockStockUnitService(productService, locationService)
const printerService = new MockPrinterService()

export { categoryService, locationService, productService, stockUnitService, printerService }
