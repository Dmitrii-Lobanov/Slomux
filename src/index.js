import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

const createStore = (reducer, initialState) => {
  let currentState = initialState
  const listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
  Component => {
    class WrappedComponent extends React.Component {
      render() {
        return (
          <Component
            {...this.props}
            {...mapStateToProps(this.context.store.getState(), this.props)}
            {...mapDispatchToProps(this.context.store.dispatch, this.props)}
          />
        )
      }

      // Change lifecycle to componentDidMount
      componentDidMount() {
        this.context.store.subscribe(this.handleChange)
      }

      handleChange = () => {
        this.forceUpdate()
      }
    }

    WrappedComponent.contextTypes = {
      store: PropTypes.object,
    }

    return WrappedComponent
  }

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store,
    }
  }
  
  render() {
    return React.Children.only(this.props.children)
  }
}

Provider.childContextTypes = {
  store: PropTypes.object,
}

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL';
// Add an action type in order to handle a button state
const CHANGE_BUTTON = 'CHANGE_BUTTON';

// action creators
const changeInterval = value => ({
  type: CHANGE_INTERVAL,
  payload: value,
});

// Create an action creator for CHANGE_BUTTON
const changeButton = value => {
  return {
    type: CHANGE_BUTTON,
    payload: value
  };
};

// reducers
// Assign default state
let defaultState = {
  interval: 1,
  isBtnDisabled: true
};

const reducer = (state, action) => {
  switch(action.type) {
    case CHANGE_INTERVAL:
    // Fix mistake in return statement which mutated the state. Instead creates a new object
      return {
        ...state,
        interval: action.payload
      };
    // Add statement in order to handle CHANGE_BUTTON state
    case CHANGE_BUTTON:
      return {
        ...state,
        btnDisabled: action.payload
      };
    default:
    // Fix mistake that returned an empty object as a default. Instead returns state.
      return state;
  }
}

// components

class IntervalComponent extends React.Component {
  // Add a state object for interval and button
  state = {
    interval: 1,
    buttonDisable: false
  };

  // Add a lifecycle in order to update component only when state changes
  componentDidUpdate(prevProps, prevState){
    if(prevState.interval !== this.state.interval){
      this.props.changeInterval(this.state.interval);
    }
  };

  // Add a button click handler instead of functions inside button tags
  onBtnClick(value) {
    if(this.state.interval === 1 && value === -1) {
      return;
    }
    this.setState({
      interval: this.state.interval + value
    });
  };

  render() {
    // Fix return statement 
    return (
      <div>
        <span>Интервал обновления секундомера: {this.state.interval} сек.</span>
        <span>
          <button onClick={() => this.onBtnClick(-1)} disabled={this.state.interval === 1 || this.props.isBtnDisabled}>-</button>
          <button onClick={() => this.onBtnClick(1)} disabled={this.props.isBtnDisabled}>+</button>
        </span>
      </div>
    );
  };
};

// Add mapStateToProps in order to connect store data with component
const Interval = connect(
  state => ({
    currInterval: state.interval,
    isBtnDisabled: state.btnDisabled
  }),
  dispatch => ({
  changeInterval: value => dispatch(changeInterval(value)),
}),
)(IntervalComponent);

class TimerComponent extends React.Component {
  // Add button disability to state
  state = {
    currentTime: 0,
    isBtnDisabled: false
  }

  handleStart = () => {
    // Disable start button in order to prevent multiple clicks 
    // and to enforce user to stop timer before clicking on start button
    this.setState({
      isBtnDisabled: true
    });
    this.props.changeButton(true);
    // Set interval for timer in accordance with interval value
    this.handle = setInterval(() => this.setState({
      currentTime: this.state.currentTime + (this.props.currentInterval || 1)
    }), (this.props.currentInterval || 1) * 1000);
  }
  
  handleStop = () => {
    // Stop timer
    clearInterval(this.handle);
    this.props.changeButton(false);
    this.setState({ 
      currentTime: 0,
      isBtnDisabled: false
    });
  };

  // Stop timer before the component is removed from the DOM
  componentWillUnmount() {
    clearInterval(this.handle);
  };

  render() {
    console.log(this.props.currentInterval);
    const {currentTime, isBtnDisabled} = this.state;

    return (
      <div>
        <Interval />
        <div>
          Секундомер: {currentTime} сек.
        </div>
        <div>
          <button onClick={this.handleStart} disabled={isBtnDisabled}>Старт</button>
          <button onClick={this.handleStop} disabled={!isBtnDisabled}>Стоп</button>
        </div>
      </div>
    )
  };
}

// Fix bugs in Timer
const Timer = connect(
  state => ({
    currentInterval: state.interval,
  }), 
  dispatch => ({
    changeButton: value => dispatch(changeButton(value))
  })
)(TimerComponent);

// init
ReactDOM.render(
  <Provider store={createStore(reducer, defaultState={defaultState})}>
    <Timer />
  </Provider>,
  document.getElementById('app')
)

// Функция connect содержала неверный lifecycle method (componentDidUpdate вместо componentDidMount).
// Во избежание снижения интервала до значения менее 1 и повторного нажатия кнопки start был создан новый action типа CHANGE_BUTTON, соответствующие action creator (changeButton) и reducer (case CHANGE_BUTTON). 
// В reducer return statement был изменен на новый объект вместо мутации существующего state, а в default пустой объект был заменен на state. 
// В компоненте IntervalComponent: 
//    - в state добавлено состояние для кнопки с целью манипулирования состоянием disabled;
//   - добавлен lifecycle method componentDidUpdate для обновления компонента только в случае изменения значения интервала;
//   - вместо функций в <button> добавлена функция onBtnClick, которая изменяет значение интервала по клику на кнопки + или -;
//   - в JSX добавлено изменение состояния disabled кнопок + и -.
// В Interval добавлены mapStateToProps для взаимодействия IntervalComponent со store. 
// В компоненте TimerComponent:
//   - добавлено состояние для кнопок start и stop;
//   - методы handleStart и handleStop подняты вверх до метода render в целях читаемости кода;
//   - в методе handleStart предусмотрено изменение состояния кнопки start в случае ее нажатия и включен метод для определения значения отображаемого времени в соответствии с установленным пользователем интепвалом;
//   - в методе handleStop предусмотрены очистка интервала и изменение состояния disabled кнопки stop;
//   - добавлен lifecycle method componentWillUnmount для очистки интервала перед тем, как компонент будет удален из DOM;
//   - в JSX в кнопки добавлен disabled.
// В Timer исправлены баги в состоянии (вместо state - state.interval). 