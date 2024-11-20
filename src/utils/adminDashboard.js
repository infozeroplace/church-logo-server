import { Order } from "../model/order.model.js";
import { Task } from "../model/task.model.js";

export const getOrderYearList = async () => {
  const uniqueOrderYears = await Order.aggregate([
    {
      $group: {
        _id: { $year: "$orderDateUTC" }, // Group by year extracted from orderDateUTC
      },
    },
    {
      $project: {
        year: { $toString: "$_id" }, // Convert year to string
        _id: 0, // Exclude _id from the result
      },
    },
    {
      $sort: { year: 1 }, // Sort years in ascending order
    },
  ]);

  // Extract the years from the aggregation result
  return uniqueOrderYears.map((item) => ({
    label: item.year,
    value: item.year,
  }));
};

export const getOrderAndSalesAnalyticData = async (query) => {
  // Aggregation pipeline function to get monthly order counts and revenue for a given year
  const getYearlyStats = async (year, statType) => {
    const aggregationPipeline = [
      {
        $match: {
          orderDateUTC: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$orderDateUTC" } },
          [statType === "order" ? "orderCount" : "monthlyRevenue"]:
            statType === "order" ? { $sum: 1 } : { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ];

    const stats = await Order.aggregate(aggregationPipeline);

    // Format the results into a 12-month array
    const formattedData = new Array(12).fill(0);
    stats.forEach((stat) => {
      const monthIndex = stat._id.month - 1;
      formattedData[monthIndex] =
        statType === "order"
          ? stat.orderCount
          : +stat.monthlyRevenue.toFixed(2);
    });

    return formattedData;
  };

  // Fetching and formatting data for both current and previous year
  const currentOrderYear = +query.orderYear || new Date().getFullYear();
  const previousOrderYear = currentOrderYear - 1;

  const currentYearOrderData = await getYearlyStats(currentOrderYear, "order");
  const previousYearOrderData = await getYearlyStats(
    previousOrderYear,
    "order"
  );

  const currentSalesYear = +query.revenueYear || new Date().getFullYear();
  const previousSalesYear = currentSalesYear - 1;

  const currentYearSalesData = await getYearlyStats(currentSalesYear, "sales");
  const previousYearSalesData = await getYearlyStats(
    previousSalesYear,
    "sales"
  );

  return {
    currentYearOrderData,
    previousYearOrderData,
    currentYearSalesData,
    previousYearSalesData,
  };
};

export const getCountsAndTotal = async () => {
  const [result] = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrderRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalOrders = await Order.countDocuments({});
  const totalTasks = await Task.countDocuments({});

  const totalActiveOrders = await Order.countDocuments({
    orderStatus: { $ne: "completed" },
  });
  const totalActiveTasks = await Task.countDocuments({
    status: { $eq: "inprogress" },
  });

  const totalCompleteOrders = await Order.countDocuments({
    orderStatus: { $eq: "completed" },
  });
  const totalCompleteTasks = await Task.countDocuments({
    status: { $eq: "completed" },
  });

  return {
    totalRevenue: (result?.totalOrderRevenue || 0) + 0 || 0,
    totalOrderRevenue: result?.totalOrderRevenue || 0,
    totalOrders,
    totalActiveOrders,
    totalCompleteOrders,
    totalTasks,
    totalActiveTasks,
    totalCompleteTasks,
  };
};

export const getOrderAndSalesOfCategoriesAnalyticData = async (query) => {
  const allCategories = [
    { _id: "logo-design", totalRevenue: 0 },
    { _id: "web-design", totalRevenue: 0 },
    { _id: "branding", totalRevenue: 0 },
    { _id: "personal-signature", totalRevenue: 0 },
    { _id: "business-advertising", totalRevenue: 0 },
    { _id: "social-media-service", totalRevenue: 0 },
  ];

  const currentCategoryYear = +query.categoryYear || new Date().getFullYear();

  // Aggregation to get total revenue by category for the current year, including categories with zero revenue
  const revenueByCategory = await Order.aggregate([
    {
      $match: {
        orderDateUTC: {
          $gte: new Date(`${currentCategoryYear}-01-01T00:00:00Z`),
          $lt: new Date(`${currentCategoryYear + 1}-01-01T00:00:00Z`),
        },
      },
    },
    {
      $group: {
        _id: "$category", // Group by category
        totalRevenue: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 }, // Count the number of orders per category
      },
    },
    {
      $facet: {
        revenueData: [{ $project: { _id: 1, totalRevenue: 1 } }],
        orderCountData: [{ $project: { _id: 1, orderCount: 1 } }],
        allCategories: [{ $replaceRoot: { newRoot: "$$ROOT" } }],
      },
    },
    {
      $project: {
        allCategories: {
          $map: {
            input: allCategories,
            as: "cat",
            in: {
              $mergeObjects: [
                "$$cat",
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$revenueData",
                        as: "rev",
                        cond: { $eq: ["$$rev._id", "$$cat._id"] },
                      },
                    },
                    0,
                  ],
                },
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$orderCountData",
                        as: "cnt",
                        cond: { $eq: ["$$cnt._id", "$$cat._id"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    { $unwind: "$allCategories" },
    { $replaceRoot: { newRoot: "$allCategories" } },
  ]);

  // Generate separate arrays for revenue and order count
  const totalRevenueByCategory = revenueByCategory.map((category) =>
    category.totalRevenue ? category.totalRevenue : 0
  );
  const totalOrderCountByCategory = revenueByCategory.map((category) =>
    category.orderCount ? category.orderCount : 0
  );

  return {
    totalRevenueByCategory,
    totalOrderCountByCategory,
  };
};

export const getOrderEarningReport = async (query) => {
  const targets = {
    daily: 100,
    weekly: 700,
    monthly: 3000,
    yearly: 36000,
  };

  // Helper function to generate start and end dates for each period
  const getDateRange = (period) => {
    const today = new Date(query.earningReportTime);
    let startDate, endDate;

    switch (period) {
      case "daily":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        startDate = new Date(today.setDate(today.getDate() - today.getDay())); // Start of the week
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        break;
      case "yearly":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear() + 1, 0, 1);
        break;
    }
    return { startDate, endDate };
  };

  // Main function to fetch revenue data for a given period
  const fetchRevenueForPeriod = async (period) => {
    const { startDate, endDate } = getDateRange(period);

    const result = await Order.aggregate([
      {
        $match: {
          orderDateUTC: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    return result[0]?.totalRevenue || 0;
  };

  // Fetch revenue for each period
  const dailyOrderRevenue = await fetchRevenueForPeriod("daily");
  const weeklyOrderRevenue = await fetchRevenueForPeriod("weekly");
  const monthlyOrderRevenue = await fetchRevenueForPeriod("monthly");
  const yearlyOrderRevenue = await fetchRevenueForPeriod("yearly");

  // Calculate progress percentages based on targets
  const calculateProgress = (revenue, target) =>
    Number(((revenue / target) * 100).toFixed(2));

  const dailyProgress = calculateProgress(dailyOrderRevenue, targets.daily);
  const weeklyProgress = calculateProgress(weeklyOrderRevenue, targets.weekly);
  const monthlyProgress = calculateProgress(
    monthlyOrderRevenue,
    targets.monthly
  );
  const yearlyProgress = calculateProgress(yearlyOrderRevenue, targets.yearly);

  return {
    dailyOrderRevenue,
    weeklyOrderRevenue,
    monthlyOrderRevenue,
    yearlyOrderRevenue,
    dailyProgress,
    weeklyProgress,
    monthlyProgress,
    yearlyProgress,
  };
};
