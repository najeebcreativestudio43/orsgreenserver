export const allMonthsTotalSalesByYear = [
  {
    $group: {
      _id: {
        month: {
          $month: "$createdAt",
        },
        year: {
          $year: "$createdAt",
        },
      },
      total: {
        $sum: "$grandTotal",
      },
    },
  },
  {
    $sort: {
      "_id.month": 1,
    },
  },
  {
    $addFields: {
      label: {
        $let: {
          vars: {
            monthsInString: [
              "",
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
          },
          in: {
            $arrayElemAt: ["$$monthsInString", "$_id.month"],
          },
        },
      },
      text: "$_id.year",
    },
  },
  {
    $project: {
      _id: 0,
    },
  },
];

export const Months = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const AllDaysTotalSalesByYearAndMonth = [
  {
    $group: {
      _id: {
        day: {
          $dayOfMonth: "$createdAt",
        },
        month: {
          $month: "$createdAt",
        },
        year: {
          $year: "$createdAt",
        },
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
      },
      total: {
        $sum: "$grandTotal",
      },
    },
  },
  {
    $sort: {
      "_id.day": 1,
    },
  },
  {
    $project: {
      _id: 0,
      total: 1,
      label: "$_id.date",
    },
  },
];

export const salesInCategory = [
  {
    $unwind: "$items",
  },
  {
    $group: {
      _id: {
        categoryId: "$items.categoryId",
      },
      total: {
        $sum: 1,
      },
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "_id.categoryId",
      foreignField: "_id",
      as: "categories",
    },
  },
  {
    $project: {
      _id: 0,
      total: 1,
      category: {
        $first: "$categories",
      },
    },
  },
  {
    $addFields: {
      label: "$category.title",
    },
  },
  {
    $project: {
      category: 0,
    },
  },
];

export const productSalesCount = [
  {
    $unwind: "$items",
  },
  {
    $group: {
      _id: {
        productId: "$items.productId",
      },
      total: {
        $sum: 1,
      },
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "_id.productId",
      foreignField: "_id",
      as: "products",
    },
  },
  {
    $project: {
      _id: 0,
      total: 1,
      product: {
        $first: "$products",
      },
    },
  },
  {
    $addFields: {
      label: "$product.title",
    },
  },
  {
    $project: {
      product: 0,
    },
  },
];

export const dailyOrderSaleReports = [
  {
    $project: {
      grandTotal: 1,
      adminId: 1,
      createdAt: 1,
      items: 1,
    },
  },
  {
    $unwind: "$items",
  },
  {
    $addFields: {
      discount: {
        $multiply: [
          {
            $subtract: ["$items.price.base", "$items.price.sale"],
          },
          "$items.quantity",
        ],
      },
      itemSales: {
        $sum: "$items.quantity",
      },
    },
  },
  {
    $group: {
      _id: {
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
      },
      total: {
        $sum: "$grandTotal",
      },
      discount: {
        $sum: "$discount",
      },
      itemSales: {
        $sum: "$itemSales",
      },
    },
  },
  {
    $sort: {
      "_id.date": 1,
    },
  },
  {
    $project: {
      label: "$_id.date",
      _id: 0,
      total: 1,
      discount: 1,
      itemSales: 1,
      netTotal: {
        $sum: ["$discount", "$total"],
      },
    },
  },
];

export const productSales = [
  {
    $project: {
      grandTotal: 1,
      adminId: 1,
      createdAt: 1,
      items: 1,
    },
  },
  {
    $unwind: "$items",
  },
  {
    $addFields: {
      discount: {
        $multiply: [
          {
            $subtract: ["$items.price.base", "$items.price.sale"],
          },
          "$items.quantity",
        ],
      },
      itemSales: {
        $sum: "$items.quantity",
      },
    },
  },
  {
    $group: {
      _id: {
        productId: "$items.productId",
      },
      total: {
        $sum: "$grandTotal",
      },
      discount: {
        $sum: "$discount",
      },
      itemSales: {
        $sum: "$itemSales",
      },
    },
  },
  {
    $sort: {
      itemSales: -1,
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "_id.productId",
      foreignField: "_id",
      as: "products",
    },
  },
  {
    $project: {
      label: {
        $first: "$products.title",
      },
      _id: 0,
      total: 1,
      discount: 1,
      itemSales: 1,
      netTotal: {
        $sum: ["$discount", "$total"],
      },
    },
  },
];
