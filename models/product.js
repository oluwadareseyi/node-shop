const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = model("Product", productSchema);

// const mongodb = require("mongodb");

// const { mongoConnect, getDb } = require("../util/database");
// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   async save() {
//     const db = getDb();
//     try {
//       if (this._id) {
//         await db
//           .collection("products")
//           .updateOne({ _id: this._id }, { $set: this });
//       } else {
//         await db.collection("products").insertOne(this);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   static async fetchAll() {
//     const db = getDb();
//     return await db
//       .collection("products")
//       .find()
//       .toArray();
//   }

//   static async findById(id) {
//     const db = getDb();
//     return await db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(id) })
//       .next();
//   }

//   static async deleteById(id) {
//     const db = getDb();
//     return await db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(id) });
//   }
// }

// module.exports = Product;
