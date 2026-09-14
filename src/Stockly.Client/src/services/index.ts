import { ApiCategoryService } from './api/ApiCategoryService'
import { ApiStorageLocationService } from './api/ApiStorageLocationService'
import { ApiProductService } from './api/ApiProductService'
import { ApiStockUnitService } from './api/ApiStockUnitService'
import { ApiPrinterService } from './api/ApiPrinterService'
import { ApiRecipeService } from './api/ApiRecipeService'
import { ApiGroceryListService } from './api/ApiGroceryListService'
import { ApiSettingsService } from './api/ApiSettingsService'
import { ApiAiService } from './api/ApiAiService'

const categoryService = new ApiCategoryService()
const locationService = new ApiStorageLocationService()
const productService = new ApiProductService()
const stockUnitService = new ApiStockUnitService()
const printerService = new ApiPrinterService()
const recipeService = new ApiRecipeService()
const groceryListService = new ApiGroceryListService()
const settingsService = new ApiSettingsService()
const aiService = new ApiAiService()

export { categoryService, locationService, productService, stockUnitService, printerService, recipeService, groceryListService, settingsService, aiService }
