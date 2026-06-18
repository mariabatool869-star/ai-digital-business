const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getAnalytics = async (req, res) => {
  try {
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });

    const productSales = {};
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        if (!productSales[key]) productSales[key] = { name: key, count: 0, revenue: 0 };
        productSales[key].count += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const users = await User.find({ createdAt: { $gte: sixMonthsAgo } });
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = users.filter(u => {
        const ud = new Date(u.createdAt);
        return ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
      }).length;
      userGrowth.push({ month: label, users: count });
    }

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const revenue = paidOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      }).reduce((s, o) => s + o.totalAmount, 0);
      monthlyRevenue.push({ month: label, revenue: Math.round(revenue * 100) / 100 });
    }

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totalRevenue, totalOrders, totalUsers, totalProducts,
      topProducts, userGrowth, monthlyRevenue, recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
