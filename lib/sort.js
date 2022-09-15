
const sortByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = { 
  sortTodoLists (todoLists) {
    let done = todoLists
      .filter(todoList => todoList.isDone())
      .sort(sortByTitle);
    let undone = todoLists
      .filter(todoList => !todoList.isDone())
      .sort(sortByTitle);

    return [].concat(undone, done);
  },

  sortTodos (todoList) {
    let done = todoList.todos
      .filter(todo => todo.isDone())
      .sort(sortByTitle);
    let undone = todoList.todos
      .filter(todo => !todo.isDone())
      .sort(sortByTitle);

    return [].concat(undone, done);
  },
}