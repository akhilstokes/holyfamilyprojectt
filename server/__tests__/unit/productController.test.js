const productController = require('../../controllers/productController');
const Product = require('../../models/productModel');
const { mockRequest, mockResponse } = require('../helpers/testHelper');

jest.mock('../../models/productModel');

describe('Product Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      const productData = {
        name: 'Rubber Sheet',
        type: 'finished',
        category: 'sheets',
        price: 100,
        unit: 'kg'
      };
      
      req.body = productData;

      const mockProduct = {
        _id: 'product123',
        ...productData
      };

      Product.create.mockResolvedValue(mockProduct);

      // Act
      await productController.createProduct(req, res);

      // Assert
      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockProduct
      });
    });

    it('should return 400 on validation error', async () => {
      // Arrange
      req.body = { name: '' }; // Invalid data

      const error = new Error('Validation failed');
      Product.create.mockRejectedValue(error);

      // Act
      await productController.createProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message
      });
    });
  });

  describe('getProducts', () => {
    it('should get all products', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', name: 'Product 1', type: 'finished' },
        { _id: '2', name: 'Product 2', type: 'raw' }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockProducts)
      };

      Product.find.mockReturnValue(mockQuery);

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({});
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        products: mockProducts
      });
    });

    it('should filter products by search query', async () => {
      // Arrange
      req.query = { q: 'rubber' };

      const mockProducts = [
        { _id: '1', name: 'Rubber Sheet', type: 'finished' }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockProducts)
      };

      Product.find.mockReturnValue(mockQuery);

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({
        name: { $regex: 'rubber', $options: 'i' }
      });
    });

    it('should filter products by type', async () => {
      // Arrange
      req.query = { type: 'finished' };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };

      Product.find.mockReturnValue(mockQuery);

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({ type: 'finished' });
    });

    it('should filter products by category', async () => {
      // Arrange
      req.query = { category: 'sheets' };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };

      Product.find.mockReturnValue(mockQuery);

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({ category: 'sheets' });
    });

    it('should filter products by active status', async () => {
      // Arrange
      req.query = { active: 'true' };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };

      Product.find.mockReturnValue(mockQuery);

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({ isActive: true });
    });

    it('should handle multiple filters', async () => {
      // Arrange
      req.query = {
        q: 'rubber',
        type: 'finished',
        category: 'sheets',
        active: 'true'
      };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };

      Product.find.mockReturnValue(mockQuery);

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({
        name: { $regex: 'rubber', $options: 'i' },
        type: 'finished',
        category: 'sheets',
        isActive: true
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Database error');
      Product.find.mockImplementation(() => {
        throw error;
      });

      // Act
      await productController.getProducts(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message
      });
    });
  });

  describe('getProductById', () => {
    it('should get product by ID', async () => {
      // Arrange
      req.params = { id: 'product123' };

      const mockProduct = {
        _id: 'product123',
        name: 'Rubber Sheet',
        type: 'finished'
      };

      Product.findById.mockResolvedValue(mockProduct);

      // Act
      await productController.getProductById(req, res);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('product123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockProduct
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.params = { id: 'nonexistent' };

      Product.findById.mockResolvedValue(null);

      // Act
      await productController.getProductById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle errors', async () => {
      // Arrange
      req.params = { id: 'invalid-id' };

      const error = new Error('Cast error');
      Product.findById.mockRejectedValue(error);

      // Act
      await productController.getProductById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      // Arrange
      req.params = { id: 'product123' };
      req.body = { name: 'Updated Product', price: 150 };

      const mockProduct = {
        _id: 'product123',
        name: 'Updated Product',
        price: 150
      };

      Product.findByIdAndUpdate.mockResolvedValue(mockProduct);

      // Act
      await productController.updateProduct(req, res);

      // Assert
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        'product123',
        req.body,
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        product: mockProduct
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.params = { id: 'nonexistent' };
      req.body = { name: 'Updated Product' };

      Product.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      await productController.updateProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      req.params = { id: 'product123' };
      req.body = { price: -10 }; // Invalid price

      const error = new Error('Validation failed');
      Product.findByIdAndUpdate.mockRejectedValue(error);

      // Act
      await productController.updateProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Arrange
      req.params = { id: 'product123' };

      const mockProduct = {
        _id: 'product123',
        name: 'Product to Delete'
      };

      Product.findByIdAndDelete.mockResolvedValue(mockProduct);

      // Act
      await productController.deleteProduct(req, res);

      // Assert
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('product123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product deleted'
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.params = { id: 'nonexistent' };

      Product.findByIdAndDelete.mockResolvedValue(null);

      // Act
      await productController.deleteProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle deletion errors', async () => {
      // Arrange
      req.params = { id: 'product123' };

      const error = new Error('Delete error');
      Product.findByIdAndDelete.mockRejectedValue(error);

      // Act
      await productController.deleteProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message
      });
    });
  });
});
