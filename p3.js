const moment = require("moment");
const data = [
  {
    discount: 220,
    itemSales: 12,
    label: "2021-09-06",
    netTotal: 1200,
    total: 980,
  },
  {
    discount: 0,
    itemSales: 6,
    label: "2021-09-08",
    netTotal: 600,
    total: 600,
  },
  {
    discount: 0,
    itemSales: 1,
    label: "2021-09-09",
    netTotal: 100,
    total: 100,
  },
];

function fillEmptyDates($agg, $defaultData, from, to) {
  const $aggObj = {}; //Taking this as an object for easy checking

  $agg.map((agg) => {
    $aggObj[agg.label] = agg; //Making an object from array entries with label as key
  });

  const $loopDate = moment(from);
  const $endDate = moment(to);

  //Starting from from date to to date, checking if any date does not have entry in $aggObje
  while ($endDate.isSameOrAfter($loopDate)) {
    let $aggDate = $loopDate.format("YYYY-MM-DD");

    if (!$aggObj.hasOwnProperty($aggDate)) {
      //If any date does not have entry, creating a new entry from default aggregates and giving it the date as current date
      $aggObj[$aggDate] = {
        label: $aggDate,
        ...$defaultData,
      };
    }
    $loopDate.add(1, "day"); //Incrementing aggregate date
  }

  //Converting back to array and sorting by date
  return Object.values($aggObj).sort((a, b) =>
    moment(a.label).isBefore(moment(b.label)) ? -1 : 1
  );
}

//You can call this function like so
const result = fillEmptyDates(
  data,
  { total: 0, discount: 0, itemSale: 0, netTotal: 0 },
  "2021-09-01",
  "2021-09-15"
);

console.log(result);
