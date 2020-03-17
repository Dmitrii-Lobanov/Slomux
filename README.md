# Slomux
React app allowing set intervals and show timer depending on interval


Функция connect содержала неверный lifecycle method (componentDidUpdate вместо componentDidMount).
Во избежание снижения интервала до значения менее 1 и повторного нажатия кнопки start был создан новый action типа CHANGE_BUTTON, соответствующие action creator (changeButton) и reducer (case CHANGE_BUTTON). 
В reducer return statement был изменен на новый объект вместо мутации существующего state, а в default пустой объект был заменен на state. 
В компоненте IntervalComponent: 
   - в state добавлено состояние для кнопки с целью манипулирования состоянием disabled;
  - добавлен lifecycle method componentDidUpdate для обновления компонента только в случае изменения значения интервала;
  - вместо функций в <button> добавлена функция onBtnClick, которая изменяет значение интервала по клику на кнопки + или -;
  - в JSX добавлено изменение состояния disabled кнопок + и -.
В Interval добавлены mapStateToProps для взаимодействия IntervalComponent со store. 
В компоненте TimerComponent:
  - добавлено состояние для кнопок start и stop;
  - методы handleStart и handleStop подняты вверх до метода render в целях читаемости кода;
  - в методе handleStart предусмотрено изменение состояния кнопки start в случае ее нажатия и включен метод для определения значения отображаемого времени в соответствии с установленным пользователем интепвалом;
  - в методе handleStop предусмотрены очистка интервала и изменение состояния disabled кнопки stop;
  - добавлен lifecycle method componentWillUnmount для очистки интервала перед тем, как компонент будет удален из DOM;
  - в JSX в кнопки добавлен disabled.
В Timer исправлены баги в состоянии (вместо state - state.interval). 
