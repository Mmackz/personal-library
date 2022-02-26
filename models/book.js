const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
   title: {
      type: String,
      required: true,
      maxlength: 40
   },
   comments: [String]
});

BookSchema.virtual("comment_count").get(function () {
   return this.comments.length;
});

module.exports = mongoose.model("Book", BookSchema);
