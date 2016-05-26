import React, { Component, PropTypes } from 'react'
import TodoItem from '../TodoItem'
import Footer from '../Footer'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from 'utils/constants'
import style from './style.scss'

const TODO_FILTERS = {
  [SHOW_ALL]: () => true,
  [SHOW_ACTIVE]: todo => !todo.completed,
  [SHOW_COMPLETED]: todo => todo.completed
}
const TAG = "MainSection:: ";

class MainSection extends Component {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
  }
  
  constructor(props, context) {
    super(props, context)
    console.log(`${TAG} props: `, props);
    this.state = { filter: SHOW_ALL }
  }

  handleClearCompleted() {
    const atLeastOneCompleted = this.props.todos.some(todo => todo.completed)
    if (atLeastOneCompleted) {
      this.props.actions.clearCompleted()
    }
  }

  handleShow(filter) {
    this.setState({ filter })
  }

  renderToggleAll(completedCount) {
    const { todos, actions } = this.props
    if (todos.size > 0) {
      return <input
        className={style.toggleAll}
        type="checkbox"
        checked={completedCount === todos.size}
        onChange={actions.completeAll} />
    }
  }

  renderFooter(completedCount) {
    const { todos } = this.props
    const { filter } = this.state
    const activeCount = todos.length - completedCount

    if (todos.length) {
      return (
        <Footer completedCount={completedCount}
          activeCount={activeCount}
          filter={filter}
          onClearCompleted={::this.handleClearCompleted}
          onShow = {::this.handleShow } />
      )
  }
}

render() {
  const { todos, actions } = this.props
  const { filter } = this.state

  const filteredTodos = todos.filter(TODO_FILTERS[filter])
  const completedCount = todos.reduce((count, todo) => {
    return todo.completed ? count + 1 : count
  }, 0)

  return (
    <section className={style.main}>
      {this.renderToggleAll(completedCount) }
      <ul className={style.normal}>
        {filteredTodos.map((todo, index) =>
          <TodoItem key={todo.id} todo={todo} {...actions} />
        ) }
      </ul>
      {this.renderFooter(completedCount) }
    </section>
  )
}
}


export default MainSection
