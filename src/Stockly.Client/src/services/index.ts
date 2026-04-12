import { ApiCategoryService } from './api/ApiCategoryService'
import { ApiStorageLocationService } from './api/ApiStorageLocationService'
import { ApiProductService } from './api/ApiProductService'
import { ApiStockUnitService } from './api/ApiStockUnitService'
import { ApiPrinterService } from './api/ApiPrinterService'
import { ApiRecipeService } from './api/ApiRecipeService'

const categoryService = new ApiCategoryService()
const locationService = new ApiStorageLocationService()
const productService = new ApiProductService()
const stockUnitService = new ApiStockUnitService()
const printerService = new ApiPrinterService()
const recipeService = new ApiRecipeService()

export { categoryService, locationService, productService, stockUnitService, printerService, recipeService }
