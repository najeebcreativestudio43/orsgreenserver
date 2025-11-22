export const countOrdersByStatusQueryWithPercetange = [
  {
    $group: {
      _id: "",
      total: {
        $sum: 1,
      },
      status: {
        $push: "$status",
      },
    },
  },
  {
    $unwind: "$status",
  },
  {
    $group: {
      _id: {
        status: "$status",
        total: "$total",
      },
      count: {
        $sum: 1,
      },
    },
  },
  {
    $project: {
      _id: "$_id.status",
      count: "$count",
      percentage: {
        $multiply: [
          {
            $divide: ["$count", "$_id.total"],
          },
          100,
        ],
      },
    },
  },
];
