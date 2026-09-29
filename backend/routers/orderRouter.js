import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const orderRouter = express.Router();

orderRouter.get(
  '/summary',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $group: {
            _id: null,
            numUsers: { $sum: 1 },
          },
        },
      ]);

      const orders = await Order.aggregate([
        {
          $group: {
            _id: null,
            numOrders: { $sum: 1 },
            totalSales: { $sum: '$totalPrice' },
          },
        },
      ]);

      const ordersPaid = await Order.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: null,
            numPaidOrders: { $sum: 1 },
            totalSales: { $sum: '$totalPrice' },
          },
        },
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayOrders = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            numOrders: { $sum: 1 },
          },
        },
      ]);

      const todaySalesPaid = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            isPaid: true,
          },
        },
        {
          $group: {
            _id: null,
            totalPrice: { $sum: '$totalPrice' },
          },
        },
      ]);
      




     
      res.send({
        users: users.length > 0 ? users : [{ numUsers: 0 }],
        orders: orders.length > 0 ? orders : [{ numOrders: 0, totalSales: 0 }],
        ordersPaid: ordersPaid.length > 0 ? ordersPaid : [{ numPaidOrders: 0, totalSales: 0 }],
        todayOrders: todayOrders.length > 0 ? todayOrders : [{ numOrders: 0 }],
        todaySalesPaid: todaySalesPaid.length > 0 ? todaySalesPaid : [{ totalPrice: 0 }],
      });

    } catch (error) {
      console.error('Summary Route Error:', error);
      res.status(500).json({ message: 'Internal Server Error in summary' });
    }
  })
);


orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    const todayOnly = req.query.today === 'true';
    const isPaid = req.query.isPaid;
    const isDelivered = req.query.isDelivered;

    let filter = {};

    if (todayOnly) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (isPaid === 'true') filter.isPaid = true;
    else if (isPaid === 'false') filter.isPaid = false;

    if (isDelivered === 'true') filter.isDelivered = true;
    else if (isDelivered === 'false') filter.isDelivered = false;

    try {
      const orders = await Order.find(filter).populate('user').sort({ createdAt: sortOrder });
      res.send(orders); 
    } catch (error) {
      console.error('>> Get Orders Error:', error.message, error.stack);
      res.status(500).json({ message: 'Internal Server Error in getOrders' });
    }
  })
);



// الطلبات الخاصة بالمستخدم الحالي
orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

// جلب تفاصيل طلب واحد
orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// إنشاء طلب جديد
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = new Order({
      orderItems: req.body.orderItems,
      user: req.user._id,
      shipping: req.body.shipping,
      payment: req.body.payment,
      itemsPrice: req.body.itemsPrice,
      taxPrice: req.body.taxPrice,
      shippingPrice: req.body.shippingPrice,
      totalPrice: req.body.totalPrice,
      //isPaid: true,
      //paidAt: Date.now(),
    });

    const createdOrder = await order.save();

    for (const item of req.body.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.save();
      }
    }

    res.status(201).send({ message: 'Order Created', order: createdOrder });
  })
);

// حذف طلب
orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      const deletedOrder = await order.remove();
      res.send({ message: 'Order Deleted', product: deletedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// دفع الطلب
orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('orderItems.product');
    if (order) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id);
        if (product && product.countInStock < item.qty) {
          return res.status(400).send({ message: `Not enough stock for product ${product.name}.` });
        }
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.payment.paymentResult = {
        payerID: req.body.payerID,
        paymentID: req.body.paymentID,
        orderID: req.body.orderID,
      };

      for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.countInStock -= item.qty;
          if (product.countInStock < 0) product.countInStock = 0;
          await product.save();
        }
      }

      const updatedOrder = await order.save();
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found.' });
    }
  })
);

// تسليم الطلب
orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      const updatedOrder = await order.save();
      res.send({ message: 'Order Delivered', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found.' });
    }
  })
);

export default orderRouter;
