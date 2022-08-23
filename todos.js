const express = require('express');
const morgan = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const todoLists = require('./lib/seed-data');
const TodoList = require('./lib/todolist');

const app = express();
const host = 'localhost';
const port = 3000;

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

const compareByTitle = (todoListA, todoListB) => {
  const titleA = todoListA.title.toLowerCase();
  const titleB = todoListB.title.toLowerCase();

  if (titleA > titleB) {
    return 1;
  } else if (titleA < titleB) {
    return -1
  } else {
    return 0;
  }
};

const sortTodoLists = lists => {
  const undone = lists.filter(list => !list.isDone());
  const done = lists.filter(list => list.isDone());

  undone.sort(compareByTitle);
  done.sort(compareByTitle);

  return [].concat(undone, done);
};

app.get('/', (req, res) => {
  res.redirect('/lists');
});

app.get('/lists/new', (req, res) => {
  res.render('new-list');
});

app.get('/lists', (req, res) => {
  res.render('lists', {
    todoLists: sortTodoLists(todoLists),
  });
});

app.post('/lists', (req, res) => {
  let title = req.body.todoListTitle.trim();
  if (title.length === 0) {
    req.flash('error', 'A title was not provided.');
    res.render('new-list', {
      flash: req.flash(),
      ...req.body,
    });
  } else if (title.length > 100) {
    req.flash('error', 'List title must be between 1 and 100 characters.');
    res.render('new-list', {
      flash: req.flash(),
      ...req.body,
    });
  } else if (todoLists.some(list => list.title === title)) {
    req.flash('error', 'List title must be unique.');
    res.render('new-list', {
      flash: req.flash(),
      ...req.body,
    })
  } else {
    todoLists.push(new TodoList(title));
    req.flash('success', 'The todo list has been created.');
    res.redirect('/lists');
  }
});

app.listen(port, host, () => {
  console.log(`Listening on port number ${port} of ${host}!`);
});