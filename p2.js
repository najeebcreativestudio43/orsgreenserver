const elements = [
  {
    _id: "60e5829a1fd8c507890bb1e5",
    isActive: true,
    parentId: null,
    title: "Dog",
    slug: "dog",
    metaTitle: "dog",
    createdAt: "2021-07-07T10:31:54.491Z",
    updatedAt: "2021-07-07T10:31:54.491Z",
    __v: 0,
  },

  /* 2 */
  {
    _id: "60e582b51fd8c507890bb1e7",
    isActive: true,
    parentId: null,
    title: "Cat",
    slug: "cat",
    metaTitle: "cat",
    createdAt: "2021-07-07T10:32:21.544Z",
    updatedAt: "2021-07-07T10:32:21.544Z",
    __v: 0,
  },

  /* 3 */
  {
    _id: "60e582cb1fd8c507890bb1e9",
    isActive: true,
    parentId: "60e5829a1fd8c507890bb1e5",
    title: "Accessories",
    slug: "accessories",
    metaTitle: "accessories",
    createdAt: "2021-07-07T10:32:43.857Z",
    updatedAt: "2021-07-07T10:32:43.857Z",
    __v: 0,
  },

  /* 4 */
  {
    _id: "60e582db1fd8c507890bb1eb",
    isActive: false,
    parentId: "60e582cb1fd8c507890bb1e9",
    title: "Cage",
    slug: "cage",
    metaTitle: "cage",
    createdAt: "2021-07-07T10:32:59.726Z",
    updatedAt: "2021-07-07T10:32:59.726Z",
    __v: 0,
  },

  /* 5 */
  {
    _id: "60e58a5801d8200888e1946a",
    isActive: true,
    parentId: "60e582cb1fd8c507890bb1e9",
    title: "Belts",
    slug: "betls",
    metaTitle: "belts",
    createdAt: "2021-07-07T11:04:56.824Z",
    updatedAt: "2021-07-07T11:04:56.824Z",
    __v: 0,
  },

  /* 6 */
  {
    _id: "60e58a9b079cb40894ed861f",
    isActive: true,
    parentId: null,
    title: "Horse",
    slug: "Horse",
    metaTitle: "horese",
    createdAt: "2021-07-07T11:06:03.439Z",
    updatedAt: "2021-07-07T11:06:03.439Z",
    __v: 0,
  },

  /* 7 */
  {
    _id: "60e58f3ba4ac020907caa64b",
    isActive: true,
    parentId: "60e582b51fd8c507890bb1e7",
    metaTitle: "accessories",
    slug: "accessories",
    title: "Accessories",
    createdAt: "2021-07-07T11:25:47.693Z",
    updatedAt: "2021-07-07T11:25:47.693Z",
    __v: 0,
  },

  /* 8 */
  {
    _id: "60e5963a43b29e0ae9ff50dd",
    isActive: true,
    parentId: null,
    title: "Monkey",
    metaTitle: "monkey",
    slug: "monkey",
    createdAt: "2021-07-07T11:55:38.225Z",
    updatedAt: "2021-07-07T11:55:38.225Z",
    __v: 0,
  },
];

var t = [];
for (var i = 0; i < elements.length; i++) {
  t[i] = elements[i];
}

// `t` represents the array of parents
// `c` represents the parent whose children should be put in the outputted array
function f(t, c) {
  // The output structure
  var a = [];
  // We loop through all the nodes to fill `a`
  for (var i = 0; i < t.length; i++) {
    // If the node has the parent `c`
    if (t[i] !== undefined && t[i].hasOwnProperty("parentId"))
      if (t[i].parentId === c) {
        // Create an object with the `id` and `sub` properties and push it
        // to the `a` array
        a.push({
          ...t[i],

          // The `sub` property's value is generated recursively
          children: f(t, t[i]._id),
        });
      }
  }

  // Finish by returning the `a` array
  return a;
}

const findParents = (arr, id) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]._id === id) {
      return [];
    } else if (arr[i].children && arr[i].children.length) {
      let t = findParents(arr[i].children, id);

      if (t !== false) {
        t.push(arr[i]._id);

        return t;
      }
    }
  }

  return false;
};

//console.log(t);
const arr = f(elements, null);
console.log(JSON.stringify(f(arr, null), null, 5));
const parentIds = findParents(arr, "60e5963a43b29e0ae9ff50dd");
console.log(parentIds);
