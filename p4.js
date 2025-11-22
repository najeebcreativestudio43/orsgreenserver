const moment = require("moment");
const monthid = 9;
const year = 2021;

const from = moment(new Date(`${year}-${monthid}-01`))
  .startOf("month")
  .format("YYYY-MM-DD");
const to = moment(new Date(`${year}-${monthid}-01`))
  .endOf("month")
  .format("YYYY-MM-DD");
const data = [
  {
    total: 100,
    label: "2021-09-06",
  },
  {
    total: 600,
    label: "2021-09-08",
  },
  {
    total: 100,
    label: "2021-09-09",
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
const result = fillEmptyDates(data, { total: 0 }, from, to);

console.log(result);
