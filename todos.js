const express = require('express');
const morgan = require('morgan');
const flash = require('express-flash');
const session = require('express-session');

const app = express();
const host = 'localhost';
const port = 3000;

const todoLists = require('./lib/seed-data.js');
const TodoList = require('./lib/todolist.js');

const sortByTitle = (todoListA, todoListB) => {
  let titleA = todoListA.title.toLowerCase();
  let titleB = todoListB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
}

const sortTodoLists = todoLists => {
  let done = todoLists
    .filter(todoList => todoList.isDone())
    .sort(sortByTitle);
  let undone = todoLists
    .filter(todoList => !todoList.isDone())
    .sort(sortByTitle);

  return [].concat(undone, done);
};

app.set('views', './views');
app.set('view engine', 'pug');

app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: 'launch-school-todos-session-id',
  resave: false,
  saveUninitialized: true,
  secret: 'this is not very secure',
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get('/lists', (req, res) => {
  res.render('lists', { 
    todoLists: sortTodoLists(todoLists),
    flash: res.locals.flash,
   });
});

app.get('/', (req, res) => {
  res.redirect('/lists');
});

app.get('/lists/new', (req, res) => {
  res.render('new-list');
});

app.post('/lists', (req, res) => {
  let title = req.body.todoListTitle.trim();
  if (title.length === 0) {
    req.flash("error", "A title was not provided.");
    res.render('new-list', {
      flash: req.flash(),
    });
  } else if (title.length > 100) {
    req.flash('error', 'List title must be between 1 and 100 characters.');
    req.flash('error', 'stacking error msgs');
    req.flash('error', 'another error msg');
    res.render('new-list', {
      flash: req.flash(),
      todoListTitle: title,
    })
  } else if (todoLists.some(list => list.title === title)) {
    req.flash('error', 'List title already exists.');
    res.render('new-list', {
      flash: req.flash(),
      todoListTitle: title,
    })
  } else {
    todoLists.push(new TodoList(title));
    req.flash('success', `${title} todo list created!`);
    res.redirect('/lists');
  }
});

app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}`);
});