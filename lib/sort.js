const compareByTitle = (itemA, itemB) => {
  const titleA = itemA.title.toLowerCase();
  const titleB = itemB.title.toLowerCase();

  if (titleA > titleB) {
    return 1;
  } else if (titleA < titleB) {
    return -1
  } else {
    return 0;
  }
};

module.exports = {
  sortTodoLists(listOfTodoLists) {
    const undone = listOfTodoLists.filter(list => !list.isDone());
    const done = listOfTodoLists.filter(list => list.isDone());
  
    undone.sort(compareByTitle);
    done.sort(compareByTitle);
  
    return [].concat(undone, done);
  },

  sortTodos(todoList) {
    const undone = todoList.todos.filter(list => !list.isDone());
    const done = todoList.todos.filter(list => list.isDone());
  
    undone.sort(compareByTitle);
    done.sort(compareByTitle);
  
    return [].concat(undone, done);
  },
};