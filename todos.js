const express = require('express');
const morgan = require('morgan');

const app = express();
const host = 'localhost';
const port = 3000;

const todoLists = require('./lib/seed-data.js');

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

  return undone.concat(done);
};

app.set('views', './views');
app.set('view engine', 'pug');

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('lists', { 
    todoLists: sortTodoLists(todoLists),
   });
});

app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}`);
});