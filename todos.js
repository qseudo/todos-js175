const express = require('express');
const morgan = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const { body, validationResult } = require('express-validator');

const todoLists = require('./lib/seed-data');
const TodoList = require('./lib/todolist');
const { sortTodoLists, sortTodos } = require('./lib/sort');

const app = express();
const host = 'localhost';
const port = 3000;

const findMatchingTodo = (todoListId, todoId) => {
  const todoList = findMatchingTodoList(todoListId);
  if (!todoList) return undefined;

  return todoList.todos.find(todo => todo.id === todoId);
};

const findMatchingTodoList = todoListId => {
  return todoLists.find(list => list.id === todoListId);
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

app.post('/lists', [
  body('todoListTitle')
    .trim()
    .isLength({ min: 1 })
    .withMessage('The list title is required.')
    .isLength({ max: 100 })
    .withMessage('List title must be between 1 and 100 characters.')
    .custom(title => {
      let duplicate = todoLists.find(list => list.title === title);
      return duplicate === undefined;
    })
    .withMessage('List title must be unique.'),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash('error', message.msg));
      res.render('new-list', {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash('success', 'The todo list has been created.');
      res.redirect('/lists');
    }
  }
);

app.get('/lists/:todoListId', (req, res, next) => {
  const todoListId = req.params.todoListId;
  const matchingTodoList = findMatchingTodoList(+todoListId);
  if (matchingTodoList === undefined) {
    next(new Error('Not found.'));
  } else {
    res.render('list', { 
      todoList: matchingTodoList,
      todos: sortTodos(matchingTodoList),
    });
  }
});

app.post('/lists/:todoListId/todos/:todoId/toggle', (req, res, next) => {
  const { todoId, todoListId } = req.params;
  const matchingTodo = findMatchingTodo(+todoListId, +todoId);

  if (matchingTodo) {
    let title = matchingTodo.title;

    if (matchingTodo.isDone()) {
      matchingTodo.markUndone();
      req.flash('success', `${title} is marked as not done!`);
    } else {
      matchingTodo.markDone();
      req.flash('success', `${title} is marked done!`);
    }
  
    res.redirect(`/lists/${todoListId}`);
  } else {
    next(new Error('Todo not found.'));
  }
});

app.post('/lists/:todoListId/todos/:todoId/destroy', (req, res, next) => {
  const { todoListId, todoId } = req.params;
  const matchingTodoList = findMatchingTodoList(+todoListId);
  const matchingTodo = findMatchingTodo(Number(todoListId), Number(todoId));

  if (!matchingTodo) {
    next(new Error('Todo not found.'));
  } else {
    let index = matchingTodoList.findIndexOf(matchingTodo);
    matchingTodoList.removeAt(index);
    req.flash('success', `Removed ${matchingTodo.title}.`);
    res.redirect(`/lists/${todoListId}`);
  }
});

app.post('/lists/:todoListId/complete_all', (req, res, next) => {
  const { todoListId } = req.params;
  const matchingTodoList = findMatchingTodoList(+todoListId);

  if (!matchingTodoList) {
    next(new Error('Todo List not found.'));
  } else {
    matchingTodoList.markAllDone();
    req.flash('success', 'All todos marked done!');
    res.redirect(`/lists/${todoListId}`);
  }
});

app.use((err, req, res) => {
  console.log(err);
  res.status(404).send(err.message);
});

app.listen(port, host, () => {
  console.log(`Listening on port number ${port} of ${host}!`);
});