const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true
  // },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = async function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;

  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }

  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return await this.save();
};

userSchema.methods.removeFromCart = async function(cartId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== cartId.toString();
  });

  const updatedcart = {
    items: updatedCartItems
  };

  this.cart = updatedcart;
  return await this.save();
};

userSchema.methods.clearCart = async function() {
  this.cart = { items: [] };
  return await this.save();
};

module.exports = model("User", userSchema);

// const { mongoConnect, getDb } = require("../util/database");

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   async save() {
//     const db = getDb();
//     await db.collection("users").insertOne(this);
//   }

//   async addToCart(product) {
//
//   }

//   async getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(item => {
//       return item.productId;
//     });
//     const products = await db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray();

//     return products.map(product => {
//       return {
//         ...product,
//         quantity: this.cart.items.find(i => {
//           return i.productId.toString() === product._id.toString();
//         }).quantity
//       };
//     });
// }

//   async addOrders() {
//     const db = getDb();

//     await db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: [] } } }
//       );

//     return orders;
//   }

//   async getOrders() {
//     const db = getDb();
//     return await db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray();
//   }

//   static async findById(userId) {
//     const db = getDb();
//     return await db
//       .collection("users")
//       .find({ _id: new ObjectId(userId) })
//       .next();
//   }

// async deleteById(cartId) {
//   const db = getDb();

// }
// }

// module.exports = User;
