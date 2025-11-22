// const elements = [
//   {
//     id: 10,
//     pId: 0,
//     title: "Cat",
//   },
//   {
//     id: 11,
//     pId: 0,
//     title: "Dog",
//   },
//   {
//     id: 13,
//     pId: 10,
//     title: "Cat Food",
//   },
//   {
//     id: 14,
//     pId: 10,
//     title: "Cat Acco",
//   },
//   {
//     id: 15,
//     pId: 11,
//     title: "Dog Food",
//   },
//   {
//     id: 16,
//     pId: 11,
//     title: "Dog Acco",
//   },
//   {
//     id: 17,
//     pId: 16,
//     title: "Dog Cages",
//   },
// ];

// var t = [];
// for (var i = 0; i < elements.length; i++) {
//   t[elements[i].id] = elements[i];
// }

// // `t` represents the array of parents
// // `c` represents the parent whose children should be put in the outputted array
// function f(t, c) {
//   // The output structure
//   var a = [];

//   // We loop through all the nodes to fill `a`
//   for (var i = 0; i < t.length; i++) {
//     // If the node has the parent `c`
//     if (t[i] !== undefined && t[i].hasOwnProperty("pId"))
//       if (t[i].pId === c) {
//         // Create an object with the `id` and `sub` properties and push it
//         // to the `a` array
//         a.push({
//           ...t[i],
//           id: i,

//           // The `sub` property's value is generated recursively
//           sub: f(t, i),
//         });
//       }
//   }

//   // Finish by returning the `a` array
//   return a;
// }
// console.log(t);
// console.log(JSON.stringify(f(t, 0), null, 5));
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { type: "app", title: "token for api key" },
  "api_key_token_secret"
);

console.log(token);
