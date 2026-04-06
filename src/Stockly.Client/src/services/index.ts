import { ApiCategoryService } from './api/ApiCategoryService'
import { ApiStorageLocationService } from './api/ApiStorageLocationService'
import { ApiProductService } from './api/ApiProductService'
import { ApiStockUnitService } from './api/ApiStockUnitService'
import { MockPrinterService } from './mock/MockPrinterService'

const categoryService = new ApiCategoryService()
const locationService = new ApiStorageLocationService()
const productService = new ApiProductService()
const stockUnitService = new ApiStockUnitService()
const printerService = new MockPrinterService()

export { categoryService, locationService, productService, stockUnitService, printerService }
