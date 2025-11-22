import { AccessControl } from "accesscontrol";
let grantsObject = {
  admin: {
    user: {
      "read:any": ["*"],
      "update:any": ["*"],
    },
    address: {
      "read:any": ["*"],
    },
    managers: {
      "read:any": ["*"],
      "update:any": ["*"],
      "create:any": ["*"],
    },
    stats: {
      "read:any": ["*"],
    },
    admin: {
      "read:own": ["*"],
      "update:own": ["*"],
      "read:any": ["*"],
    },
    appConfig: {
      "read:any": ["*"],
      "create:any": ["*"],
    },
  },
  manager: {
    appConfig: {
      "read:any": ["*"],
    },
    purchase: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
    banners: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
    product: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
    },
    admin: {
      "read:own": ["*"],
      "update:own": ["*"],
      "read:any": ["*"],
    },
    category: {
      "read:own": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"],
      "create:own": ["*"],
    },
    subcategory: {
      "read:own": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"],
      "create:own": ["*"],
    },
    productcategory: {
      "read:own": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"],
      "create:own": ["*"],
    },
    attributes: {
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
      "create:any": ["*"],
    },
    brand: {
      "read:own": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"],
      "create:own": ["*"],
    },
    brandGallery: {
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
      "create:any": ["*"],
    },
    generalNotificationGallery: {
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
      "create:any": ["*"],
    },
    categoryGallery: {
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
      "create:any": ["*"],
    },
    subcategoryGallery: {
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
      "create:any": ["*"],
    },
    productGallery: {
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
      "create:any": ["*"],
    },
    address: {
      "read:any": ["*"],
    },
    user: {
      "read:any": ["*"],
      "update:any": ["*"],
    },
    userOrder: {
      "read:own": ["*"],
    },
    order: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
    orderItem: {
      "read:own": ["*"],
      "delete:own": ["*"],
      "update:own": ["*"],
      "create:own": ["*"],
    },
    notification: {
      "create:any": ["*"],
      "read:own": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"],
    },
    orderState: {
      "read:own": ["*"],
    },
  },
  user: {
    notifications: {
      "read:own": ["*"],
      "create:own": ["*"],
      "delete:own": ["*"],
      "update:own": ["*"],
    },
    cart: {
      "read:any": ["*"],
    },
    favorite: {
      "read:own": ["*"],
      "create:own": ["*"],
      "delete:own": ["*"],
    },
    user: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
    address: {
      "read:own": ["*"],
      "create:own": ["*"],
      "delete:own": ["*"],
      "update:own": ["*"],
    },
    payment: {
      "read:own": ["*"],
      "create:own": ["*"],
      "delete:own": ["*"],
    },
    order: {
      "read:own": ["*"],
      "delete:own": ["*"],
      "update:own": ["*"],
      "create:own": ["*"],
    },
    orderItem: {
      "read:own": ["*"],
      "delete:own": ["*"],
      "update:own": ["*"],
      "create:own": ["*"],
    },
    // profile: {
    //   "read:own": ["*"],
    //   "update:own": ["*"],
    // },
  },
};
const accessControl = new AccessControl(grantsObject);

export default accessControl;
// const ac = new AccessControl();

// export default (function () {
//   ac.grant("admin")
//     .updateAny("product")
//     .deleteAny("product")
//     .readAny("product")
//     .createAny("product")
//     .updateOwn("profile");

//   return ac;
// })();
