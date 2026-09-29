import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import Product from '../models/productModel.js';
import Image from '../models/imageModel.js';

const productRouter = express.Router();

productRouter.get(
  '/bestrating',
  expressAsyncHandler(async (req, res) => {
    try {
      const bestRating = await Product.find({
        rating: { $ne: null },
        numReviews: { $ne: null },
        
      })
        .sort({  rating: -1, numReviews: -1 })
        .limit(8); 

      res.send(bestRating);
    } catch (error) {
      console.error('Error in bestRating route:', error);
      res.status(500).send({ message: 'Failed to load bestRating' });
    }
  })
);


productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const searchKeyword = req.query.searchKeyword
      ? {
          name: {
            $regex: req.query.searchKeyword,
            $options: 'i',
          },
        }
      : {};

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

      const sortOption = req.query.sort
      ? req.query.sort === 'newest'
        ? { createdAt: -1 }
        : req.query.sort === 'oldest'
        ? { createdAt: 1 }
        : req.query.sort === 'lowest'
        ? { price: 1 }
        : req.query.sort === 'highest'
        ? { price: -1 }
        : {}
      : {};

    const products = await Product.find({ ...searchKeyword, ...categoryFilter })
      .sort(sortOption)
      .exec();

    res.send(products);
  })
);


productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
  
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id }, 
      }).limit(4); 

      res.send({ ...product._doc, relatedProducts }); 
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = new Product({
      name: 'sample product',
      description: 'sample desc',
      category: 'sample category',
      brand: 'sample brand',
      image: '/',
      price: 0, 
      countInStock: 0,
    });
    const createdProduct = await product.save();
    if (createdProduct) {
      res
        .status(201)
        .send({ message: 'Product Created', product: createdProduct });
    } else {
      res.status(500).send({ message: 'Error in creating product' });
    }
  })
);
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.brand = req.body.brand;
      product.category = req.body.category;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await product.save();
      if (updatedProduct) {
        res.send({ message: 'Product Updated', product: updatedProduct });
      } else {
        res.status(500).send({ message: 'Error in updaing product' });
      }
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      // لو المنتج ليه صورة
      if (product.image && product.image.startsWith('/api/images/')) {
        try {
          const imageId = product.image.split('/api/images/')[1];
          if (imageId) {
            await Image.findByIdAndDelete(imageId);
            console.log(`Image ${imageId} deleted from DB`);
          }
        } catch (err) {
          console.error('Error deleting image:', err.message);
        }
      }

      const deletedProduct = await product.deleteOne();
      res.send({ message: 'Product and Image Deleted', product: deletedProduct });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      const review = {
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user._id,
        name: req.user.name,
      };
      product.reviews.push(review);
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      product.numReviews = product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Comment Created.',
        data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      throw Error('Product does not exist.');
    }
  })
);


productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

export default productRouter;
