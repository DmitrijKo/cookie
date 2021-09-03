import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";

const PORT = 3000;
const WEB = "web";

const users = [
  {
    user: "alius",
    pass: "ok",
  },
];

const app = express();
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      eq(p1, p2) {
        return p1 === p2;
      },
      dateFormat(d) {
        if (d instanceof Date) {
          const year = d.getFullYear();
          let month = d.getMonth() + 1;
          if (month < 10) {
            month = "0" + month;
          }
          let day = d.getDate();
          if (day < 10) {
            day = "0" + day;
          }
          return `${year}-${month}-${day}`;
        } else {
          return d;
        }
      },
    },
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
  }),
);
app.set("view engine", "handlebars");
app.use(session({
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: 30000,
  },
  secret: "cia_mano_sessiju_pass",
}));
app.use(express.static(WEB));
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

app.get("/users", (req, res) => {
  let loggedIn = false;
  let user = undefined;
  let counter = 0;
  if (req.session) {
    user = req.session.user;
    counter = req.session.counter;
    if (user) {
      loggedIn = true;
    }
  }
  res.render("users", {
    title: "Main view",
    user,
    counter,
    users: (loggedIn) ? users : null,
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/doLogin", (req, res) => {
  const user = users.find((e) => e.user === req.body.user);
  if (user && user.pass === req.body.pass) {
    req.session.user = req.body.user;
    req.session.counter = 1;
    res.redirect("/users");
  } else {
    res.render("login", {
      error: "Failed to login",
    });
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/doRegister", (req, res) => {
  const user = users.find((e) => e.user === req.body.user);
  if (user) {
    res.render("register", {
      error: "User already exists",
    });
  } else {
    if (req.body.user === "" || req.body.pass === "") {
      res.render("register", {
        error: "User name or password can not be empty",
      });
    } else {
      users.push({
        user: req.body.user,
        pass: req.body.pass,
      });
      res.redirect("/users");
    }
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/users");
  });
});

app.get("/test", (req, res) => {
  if (req.session) {
    req.session.counter++;
  }
  res.redirect("/users");
});

app.listen(PORT);
console.log(`Server started on port ${PORT}`);
