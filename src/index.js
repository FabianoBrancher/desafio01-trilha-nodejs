const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!"});  
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  if (name && username) {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(user);
  
    return response.status(201).json(user);
  }

  return response.status(400).json({ error: "Name or Username cannot be empty"})

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found"});
  }

  if (!title || !deadline) {
    return response.status(400).json({ error: "Title or deadline cannot be empty"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return response.status(404).json({ error: "Todo not found "});
  }

  user.todos[index].done = true;

  return response.json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const index = user.todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return response.status(404).json({ error: "Todo not found "});
  }

  user.todos.splice(index, 1);
  return response.status(204).json();

});

module.exports = app;