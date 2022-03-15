const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;

  const user = users.find(user => user.username === username);

  if (!user) {
    return next();
  }

  request.headers.username = username;
  return response.status(400).json({ error: "Username already exists!"}); 
}

app.post('/users', checksExistsUserAccount, (request, response) => {
  const { name, username } = request.body;

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
  const { username } = request.headers;
 
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "Username not found!"});
  }

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "Username not found!"});
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "Username not found"});
  }
  
  const index = user.todos.findIndex((todo) => todo.id === id);

  if (index === -1) {
    return response.status(404).json({ error: "Todo not found"});
  }

  if (!title || !deadline) {
    return response.status(400).json({ error: "Title or deadline cannot be empty"});
  }

  const updateTodo = {
    ...user.todos[index],
    title,
    deadline,
    done: false
  };

  user.todos[index] = updateTodo;

  return response.json({
    title,
    deadline,
    done: false,
  });

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found"});
  }

  const index = user.todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return response.status(404).json({ error: "Todo not found "});
  }

  user.todos[index].done = true;

  return response.json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found"});
  }
  
  const index = user.todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return response.status(404).json({ error: "Todo not found "});
  }

  user.todos.splice(index, 1);
  return response.status(204).send();

});

module.exports = app;