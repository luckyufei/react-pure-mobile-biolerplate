import React, { Component } from 'react'
import {Link} from 'react-router'
import { Header, MainSection} from 'components/todo'
import style from './style.scss'

export default class TodoApp extends Component {

  constructor(props) {
    super(props);

    this.actions = {};
    ['addTodo', 'deleteTodo', 'editTodo', 'completeTodo', 'completeAll', 'clearCompleted'].forEach(action => {
      this[action] = this[action].bind(this);
      this.actions[action] = this[action];
    });
    this.state = {
      todos: [
        {
          text: 'React Todo',
          completed: false,
          id: 0
        }
      ]
    }
  }

  render() {
    const {  children } = this.props
    const actions = this.actions
    return (
      <div className={style.normal}>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={this.state.todos} actions={actions} />
        {children}
        <Link to='/hello'>Hello</Link>
      </div>
    )
  }

  addTodo(text) {
    const {todos} = this.state;
    this.setState({
      todos: todos.concat([{
        text,
        id: todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1
      }])
    });
  }

  deleteTodo(id) {
    const {todos} = this.state;
    this.setState({
      todos: todos.filter(todo => todo.id !== id)
    });
  }

  editTodo(id, text) {
    const {todos} = this.state;
    this.setState({
      todos: todos.map(todo => {
        if (todo.id != id) return todo;
        todo.text = text;
        return todo;
      })
    });
  }

  completeTodo(id) {
    const {todos} = this.state;
    this.setState({
      todos: todos.map(todo => {
        if (todo.id != id) return todo;
        todo.completed = !todo.completed;
        return todo;
      })
    });
  }

  completeAll() {
    const {todos} = this.state;
    const areAllMarked = todos.every(todo => !!todo.completed);
    this.setState({
      todos: todos.map(todo => {
        todo.completed = !areAllMarked;
        return todo;
      })
    });
  }

  clearCompleted() {
    const {todos} = this.state;
    this.setState({
      todos: todos.filter(todo => !todo.completed)
    });
  }
}

