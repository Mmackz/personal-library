/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { default: mongoose } = require("mongoose");
const Book = require("../models/book");
const isObjectId = require("mongoose").isValidObjectId;

module.exports = function (app) {
   app.route("/api/books")
      .get(function (req, res, next) {
         Book.find({}, (err, data) => {
            res.json(
               data.map((d) => ({
                  _id: d._id,
                  title: d.title,
                  commentcount: d.comment_count,
                  comments: d.comments
               }))
            );
         });
      })

      .post(function (req, res, next) {
         const { title } = req.body;

         // If no title, respond with error
         if (!title) {
            res.send("missing required field title");
         } else {
            // emter book into database
            const book = new Book({ title });
            book.save((err, data) => {
               if (err) {
                  res.json({ error: "There was a db error (Title too long)" });
               } else {
                  res.json({ _id: data._id, title: data.title });
               }
            });
         }
      })

      .delete(function (req, res) {
         Book.deleteMany({}, (err, d) => {
            if (err) {
               res.json(err);
            } else {
               console.log(d);
               res.send("complete delete successful");
            }
         });
      });

   app.route("/api/books/:id")
      .get(function (req, res) {
         const { id } = req.params;

         if (isObjectId(id)) {
            Book.findById(id, (err, data) => {
               if (err) {
                  res.json({ error: "error searching database" });
               } else if (!data) {
                  res.send("no book exists");
               } else {
                  res.json({
                     _id: data._id,
                     title: data.title,
                     comments: data.comments,
                     commentcount: data.comment_count
                  });
               }
            });
         } else {
            res.send("no book exists");
         }
      })

      .post(function (req, res) {
         const { id } = req.params;
         const { comment } = req.body;

         if (!isObjectId(id)) {
            res.send("no book exists"); 
         } else if (!comment) {
            res.send("missing required field comment");
         } else {
            Book.findByIdAndUpdate(
               id,
               { $push: { comments: comment } },
               { new: true },
               (err, data) => {
                  if (err) {
                     res.json({ error: "error searching database" });
                  } else if (!data) {
                     res.send("no book exists");
                  } else {
                     res.json({
                        _id: data._id,
                        title: data.title,
                        comments: data.comments,
                        commentcount: data.comment_count
                     });
                  }
               }
            );
         }
      })

      .delete(function (req, res) {
         const { id } = req.params;

         if (!id || !isObjectId(id)) {
            res.send("no book exists");
         } else {
            Book.findByIdAndDelete(id, (err, data) => {
               if (err) {
                  res.json({ error: "error searching database" });
               } else if (!data) {
                  res.send("no book exists");
               } else {
                  res.send("delete successful");
               }
            });
         }
      });
};
