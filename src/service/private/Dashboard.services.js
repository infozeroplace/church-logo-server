import httpStatus from "http-status";
import { countryList } from "../../constant/countries.constant.js";
import ApiError from "../../error/ApiError.js";
import { Lead } from "../../model/lead.model.js";
import {
  getCountsAndTotal,
  getOrderAndSalesAnalyticData,
  getOrderAndSalesOfCategoriesAnalyticData,
  getOrderEarningReport,
  getOrderYearList,
} from "../../utils/adminDashboard.js";

const getAdminDashboardData = async (user, query) => {
  if (user.role !== "super_admin" && user.role !== "admin") {
    throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED ACCESS!");
  }

  const leadResult = await Lead.aggregate([
    {
      $group: {
        _id: { $toLower: "$countryName" }, // Group by country in lowercase for consistency
        lead: { $sum: 1 }, // Count the number of leads per country
      },
    },
    {
      $lookup: {
        from: "users",
        let: { country: "$_id" }, // Pass the lowercase country name from leads
        pipeline: [
          {
            $match: { $expr: { $eq: [{ $toLower: "$country" }, "$$country"] } },
          },
        ],
        as: "users",
      },
    },
    {
      $lookup: {
        from: "orders",
        let: { country: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toLower: "$contactDetails.country" }, "$$country"],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalPrice: { $sum: "$totalPrice" }, // Sum of totalPrice for each country
              orderCount: { $sum: 1 }, // Count the number of orders for each country
            },
          },
        ],
        as: "orders",
      },
    },
    {
      $project: {
        lead: 1,
        registered: { $size: "$users" }, // Count registered users per country from the lookup
        totalPrice: {
          $ifNull: [{ $arrayElemAt: ["$orders.totalPrice", 0] }, 0],
        }, // Extract totalPrice from orders lookup
        orderCount: {
          $ifNull: [{ $arrayElemAt: ["$orders.orderCount", 0] }, 0],
        }, // Extract orderCount from orders lookup
      },
    },
  ]);

  // Convert countryList to a Map for faster lookups
  const countryCodeMap = new Map(
    countryList.map(({ country, code }) => [country.toLowerCase(), code])
  );

  // Map leadResult to final structure using country codes
  const countries = leadResult.reduce(
    (acc, { _id, lead, registered, totalPrice, orderCount }) => {
      const countryCode = countryCodeMap.get(_id); // Retrieve country code
      if (countryCode) {
        acc[countryCode] = {
          lead,
          registered,
          revenueByOrders: totalPrice,
          totalOrders: orderCount, // Add total orders count to final structure
        };
      }
      return acc;
    },
    {}
  );



  // GET EARNING REPORTS OF ORDERS BY DAILY, WEEKLY, MONTHLY AND YEARLY
  const orderEarningReport = await getOrderEarningReport(query);
  // ...................................................

  // RETRIEVING ALL THE YEAR LIST OF ORDER WHEN COMPANY STARTS
  const orderYearList = await getOrderYearList();
  // ..........................................
  // ..........................................

  // ORDER AND REVENUE ANALYTICS ....................
  const {
    currentYearOrderData,
    previousYearOrderData,
    currentYearSalesData,
    previousYearSalesData,
  } = await getOrderAndSalesAnalyticData(query);
  // ...............................................
  // ...............................................

  // WIDGETS COUNTING ORDERS, TASKS, ETC.
  const {
    totalRevenue,
    totalOrderRevenue,
    totalOrders,
    totalActiveOrders,
    totalCompleteOrders,
    totalTasks,
    totalActiveTasks,
    totalCompleteTasks,
  } = await getCountsAndTotal();
  // .................................
  // .................................

  // YEARLY ORDER AND SALES DATA BY CATEGORY
  const { totalRevenueByCategory, totalOrderCountByCategory } =
    await getOrderAndSalesOfCategoriesAnalyticData(query);
  // ............................................................
  // ............................................................

  return {
    countries,
    orderYearList,
    counts: {
      totalRevenue,
      totalOrderRevenue,
      totalOrders,
      totalActiveOrders,
      totalCompleteOrders,
      totalTasks,
      totalActiveTasks,
      totalCompleteTasks,
    },
    yearlyRevenue: {
      currentYear: {
        orderData: currentYearOrderData,
        salesData: currentYearSalesData,
      },
      previousYear: {
        orderData: previousYearOrderData,
        salesData: previousYearSalesData,
      },
    },
    yearlyRevenueByCategory: {
      totalRevenueByCategory,
      totalOrderCountByCategory,
    },
    earningReports: {
      orderEarningReport,
    },
  };
};

export const DashboardService = { getAdminDashboardData };
