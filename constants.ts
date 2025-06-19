

export const MOCK_API_KEY = typeof process !== 'undefined' && process.env && process.env.API_KEY ? process.env.API_KEY : "YOUR_DUMMY_API_KEY_FOR_FRONTEND_ONLY";

export const API_BASE_URL = 'http://localhost:8080/api/v1';


export const CATEGORIES: string[] = [
  "Electronics", "Furniture", "Groceries", "Books", "Clothing", "Toys", "Sports","Laptops", "Accessories", "Smartphones", "Tablets", "Chargers", "Wearables", "E-readers", "Storage", "Graphics Cards", "Monitors", "Printers", "3D Printers", "Keyboards", "Audio", "Cameras", "Drones", "Gaming Consoles", "Gaming Handhelds", "Cooling", "Networking"

];
