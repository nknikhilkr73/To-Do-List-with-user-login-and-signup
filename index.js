const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

let today = new Date();
let options = {
  weekday: "long",
  day: "numeric",
  month: "short",
};
let day = today.toLocaleDateString("en-US", options);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://nknikhilkr73:lTimO8ISQVSlN4Jq@cluster0.zoeey6c.mongodb.net/newww",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to your TodoList!",
});
const item2 = new Item({
  name: "Hit + to add a new Item",
});

const item3 = new Item({
  name: "Click The CheckBox to delete an item",
});

////////////////////////////////////////////////

// const { ObjectId } = mongoose.Schema;
const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  data: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});
const User = mongoose.model("User", userSchema);
///////////////////////////////////////////////////
//
const exampleSchema = new mongoose.Schema({
  name: String,
});
const example = new mongoose.model("example", exampleSchema);
const example1 = new example({
  name: "Welcome to your TodoList!",
});
const example2 = new example({
  name: "Hit + to add a new Item",
});
const example3 = new example({
  name: "Click The CheckBox to delete an item",
});
////////////////////////////////////////////////

const defaultItems = [item1, item2, item3];
const defaultExamples = [example1, example2, example3];
let f = 0;
let id = 0;
let login = 0;

// logout.addEventListener("click", function () {
//   id = 0;
//   login = 0;
// });

app.get("/login", function (req, res) {
  res.render("login", { listTitle: "Today" });
});
app.get("/register", function (req, res) {
  res.render("signup", { listTitle: "Today" });
});
//////////////////////////////////////////////////
//
app.get("/", function (req, res) {
  if (login != 0) {
    User.findOne({
      userName: login,
    })
      .then((user) => {
        Item.find({ _id: { $in: user.data } })
          .then((items) => {
            res.render("NewList", {
              userID: login,
              listTitle: day,
              newListItems: items,
            });
          })
          .catch((err) => {
            console.log("can't add the login items");
          });
      })
      .catch((err) => {
        console.log("can't add the login.. items");
      });
  } else if (id != 0) {
    User.findOne({
      userName: id,
    })
      .then((user) => {
        Item.find({ _id: { $in: user.data } })
          .then((items) => {
            res.render("NewList", {
              userID: id,
              listTitle: day,
              newListItems: items,
            });
          })
          .catch((err) => {
            console.log("can't add the id items");
          });
      })
      .catch((err) => {
        console.log("can't add the idd items");
      });
  } else {
    example
      .find()
      .then((items) => {
        if (items.length === 0) {
          example
            .insertMany(defaultExamples)
            .then(function (res) {
              console.log("succesfully added the default items");
            })
            .catch(function (err) {
              console.log(err);
            });
          res.redirect("/");
        } else {
          res.render("NewList", {
            userID: "Example",
            listTitle: day,
            newListItems: items,
          });
        }
      })
      .catch((err) => {
        console.log("can't add the original items");
      });
  }
});
///////////////////////////////////////////////////////
// INFORMATION FROM THE ROOT
app.post("/", function (req, res) {
  if (id === 0 && login === 0) {
    const itemName = req.body.newItem;

    const item = new example({
      name: itemName,
    });
    item.save();
  } else {
    const itemName = req.body.newItem;

    const item = new Item({
      name: itemName,
    });
    item
      .save()
      .then(() => {
        if (id != 0) {
          return User.findOneAndUpdate(
            { userName: id },
            {
              $push: { data: item._id },
            },
            { new: true }
          );
        } else if (login != 0) {
          return User.findOneAndUpdate(
            { userName: login },
            {
              $push: { data: item._id },
            },
            { new: true }
          );
        }
      })
      .then((user) => {})
      .catch((err) => {
        console.log(err);
      });
  }

  res.redirect("/");
});
/////////////////////////////////////////////////
//      INFORMATION FROM THE  LOGIN PART
app.post("/login", function (req, res) {
  const username = req.body.uN;
  const pass = req.body.pass;

  User.find().then((Users) => {
    let x = 0;
    for (let i = 0; i < Users.length; i++) {
      if (Users[i].userName === username && Users[i].password === pass) {
        example
          .deleteMany({})
          .then(() => console.log("Cleared example collection"))
          .catch((err) => console.log(err));

        login = username;
        id = 0;
        x = 1;
      }
    }
    if (x === 0) {
      return res.send(
        "<script>alert('Incorect Username Or password'); window.location='/login';</script>"
      );
    } else {
      res.redirect("/");
    }
  });
});
//////////////////////////////////////////////////
//    INFORMATION FROM THE  SIGN UP PART
app.post("/register", function (req, res) {
  const uN = req.body.uN;
  id = uN;
  login = 0;
  const pass = req.body.pass;
  if (uN != "" && pass != "") {
    User.find().then((Users) => {
      let x = 0;
      for (let i = 0; i < Users.length; i++) {
        if (Users[i].userName === uN) {
          x = 1;
          return res.send(
            "<script>alert('This User name is already taken'); window.location='/register';</script>"
          );
        }
      }
      if (x === 0) {
        const user = new User({
          userName: uN,
          password: pass,
        });
        user
          .save()
          .then(() => {
            User.findById(user._id)
              .populate("data")
              .then((user) => {})
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });

        example
          .deleteMany({})
          .then(() => console.log("Cleared example collection"))
          .catch((err) => console.log(err));

        res.redirect("/");
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/register");
  }
});
////////////////////////////////////////////////////
//     DELETION PART
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  if (id === 0 && login === 0) {
    example
      .findByIdAndRemove(checkedItemId)
      .then((removedItem) => {})
      .catch((err) => {
        console.log(err);
      });
  } else {
    Item.findByIdAndRemove(checkedItemId)
      .then((removedItem) => {
        if (id != 0) {
          return User.findOneAndUpdate(
            { userName: id },
            { $pull: { data: removedItem._id } },
            { new: true }
          );
        } else if (login != 0) {
          return User.findOneAndUpdate(
            { userName: login },
            { $pull: { data: removedItem._id } },
            { new: true }
          );
        }
      })
      .then((x) => {})
      .catch((err) => console.log("Some err Occured"));
  }
  res.redirect("/");
});
app.post("/logout", function (req, res) {
  id = 0;
  login = 0;
  res.redirect("/");
});
//////////////////////////////////////////////////////
// HELP
app.get("/help", function (req, res) {
  res.render("help");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started");
});
