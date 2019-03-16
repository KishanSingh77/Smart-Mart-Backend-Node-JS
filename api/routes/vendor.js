const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Vendor = require("../models/vendor");

router.post("/signup", (req, res, next) => {
  Vendor.find({ email: req.body.email })
    .exec()
    .then(vendor => {
      console.log("finding vendor exists or not?");

      if (vendor.length >= 1) {
        return res.status(409).json({
          message: " Vendor Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const vendor = new Vendor({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            console.log({ vendor });

            vendor
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "Vendor created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  Vendor.find({ email: req.body.email })
    .exec()
    .then(vendor => {
      if (vendor.length < 1) {
        return res.status(401).json({
          message: " vendor Auth failed"
        });
      }
      bcrypt.compare(req.body.password, vendor[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "vendor Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: vendor[0].email,
              vendorId: vendor[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:vendorId", (req, res, next) => {
  Vendor.remove({ _id: req.params.vendorId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Vendor deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
