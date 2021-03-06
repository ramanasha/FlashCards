import { 
  ADD_QUIZ, 
  ADD_QUIZZES, 
  ADD_QUESTION, 
  DELETE_QUIZ, 
  DELETE_QUESTION,
} from '../actions'

function quizzes (state ={}, action) {
  const { key, quizData, quizzes, question } = action
  switch(action.type) {
    case ADD_QUIZZES:
      return {
        ...state,
        ...quizzes,
      }
    case ADD_QUIZ:
      return {
        ...state,
        [key]: quizData,
      }
    case ADD_QUESTION:
      return {
        ...state,
        [key]: {
          ...state[key],
          'questions': [...state[key].questions, question]
        }
      }
    case DELETE_QUIZ:
      return (
        Object.keys(state).reduce((newState, quiz) => {
          if(quiz !== key) {
            newState[quiz] = state[quiz]
          }
          return newState
        }, { })
      )
    case DELETE_QUESTION:
      return {
        ...state,
        [key]: {
          ...state[key],
          'questions': state[key].questions.filter((q) => {
             return q.quesiton !== question.question && q.answer !== question.answer
          })
        }
      }
    default:
      return state
  }
}

export default quizzes
