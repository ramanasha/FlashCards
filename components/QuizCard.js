import React, { Component } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  Platform, 
  TouchableOpacity, 
  TextInput,
  Animated,
  Dimensions,
  Alert,
} from 'react-native'
import { lightGray, lightRed, black, darkGray, lightGreen } from '../utils/colors'
import { connect } from 'react-redux'
import { mainFont, ansFont } from '../utils/helpers'
import { Ionicons } from '@expo/vector-icons'
import { getIcon, removeLocalNotification, setLocalNotification } from '../utils/helpers'
import { deleteQuestion } from '../actions'
import { deleteQuestionFromQuiz } from '../utils/api'
import { NavigationActions } from 'react-navigation'

class QuizCard extends Component {
  state = {
    cardIndex: 0,
    answer: false,
    numCorrect: 0,
    iosEye: 'ios-eye',
    androidEye: 'md-eye',
  }

  flipCard = () => {
    this.setState((state) => ({
      answer: !state.answer,
      iosEye: state.answer ? 'ios-eye' : 'ios-eye-off',
      androidEye: state.answer ? 'md-eye' : 'md-eye-off',
      }
    ))
  }

  correct = () => {
    //TODO start setting local notifications reminder once past intial release stage
    //this.resetNotificationIfQuizCompleted()

    this.setState((state) => ({
      cardIndex: state.cardIndex + 1,
      numCorrect: state.numCorrect + 1,
      answer: false,
      iosEye: 'ios-eye',
      androidEye: 'md-eye',
    }))
  }

  incorrect = () => {
    //this.resetNotificationIfQuizCompleted()

    this.setState((state) => ({
      cardIndex: state.cardIndex + 1,
      answer: false,
      iosEye: 'ios-eye',
      androidEye: 'md-eye',
    }))
  }

  restartQuiz = (title, shuffle) => {
    const { goBack } = this.props
    goBack()

    const navigateAction = NavigationActions.navigate({
      routeName: 'QuizCard',
      params: { title, shuffle },
    })
    this.props.navigation.dispatch(navigateAction)
  }

  resetNotificationIfQuizCompleted() {
    const { cardIndex } = this.state
    const { numQuestions } = this.props
    if ( cardIndex + 1 === numQuestions ) {
      removeLocalNotification()
        .then(setLocalNotification)
    }
  }

  confirmDeletion(key, questions, index) {
    const { deleteQuestion, goBack, numQuestions } = this.props
    Alert.alert(
      'Confirm Deletion of Quiz Card',
      `Are you sure you want to delete this question from the ${key} quiz?`,
      [
        { 
          text: "Cancel", 
          onPress: () => console.log("cancel")
        },
        { 
          text: "Delete", 
          onPress: () => {
            deleteQuestionFromQuiz({ key: key, question: questions[index] })
              .then(() => {
                if (numQuestions === 1) {
                  goBack()
                }
                this.setState({
                  answer: false,
                  iosEye: 'ios-eye',
                  androidEye: 'md-eye',
                })
                deleteQuestion({ key: key, question: questions[index] })
              })
          }
        }, 
      ],
      {cancelable: false},
    )
  }

  static navigationOptions = ( { navigation } ) => {
    const { title } = navigation.state.params

    return {
      title,
      headerTitleStyle: { fontSize: 25 },
    }
  }
  render() {
    const { title, shuffle } = this.props.navigation.state.params
    const { cardIndex, answer, numCorrect, iosEye, androidEye } = this.state
    const { questions, numQuestions, goBack } = this.props
    return (
      <View style={[styles.outerContainer]}>
        {cardIndex === numQuestions 
          ? <View style={styles.containerResults}>
            <Text style={styles.textAns}> You have correctly answered {numCorrect} out of {numQuestions}! </Text>
            <View>
              <View style={styles.correctBtnView}>
                <TouchableOpacity 
                  style={Platform.OS === 'ios' ? styles.incorrectBtn : styles.androidIncorrectBtn }
                  onPress={() => this.restartQuiz(title, shuffle)}
                >
                  <Text style={styles.submitBtnText}> Restart Quiz </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.incorrectBtnView}>
                <TouchableOpacity 
                  style={Platform.OS === 'ios' ? styles.incorrectBtn : styles.androidIncorrectBtn}
                  onPress={() => goBack()}
                >
                  <Text style={styles.submitBtnText}> Back to Deck </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          : <View style={[styles.container]}>
            <View style={styles.topView}>
              <Text style={styles.textQuestionCount}> { cardIndex + 1 }/{ numQuestions } </Text>
              <TouchableOpacity
                onPress={() => this.confirmDeletion(title, questions, cardIndex)}
              >
                <Text style={styles.removeTxt}>
                  { Platform.OS === 'ios' 
                    ? getIcon(Ionicons, black, 'ios-trash', 20)
                    : getIcon(Ionicons, black, 'md-trash', 20)
                  }
              </Text>
              </TouchableOpacity>
            </View>
              <View>
                <Text style={styles.text}> { questions[cardIndex].question } </Text> 
                <TouchableOpacity
                  onPress={this.flipCard}
                >
                  <Text style={styles.textFlipBtn}> 
                    { Platform.OS === 'ios' 
                      ? getIcon(Ionicons, black, iosEye) 
                      : getIcon(Ionicons, black, androidEye) 
                    }
                  </Text>
                  { answer && <Text style={styles.textAns}> { questions[cardIndex].answer } </Text> }
                </TouchableOpacity>
              </View>
              <View>
                <View style={styles.correctBtnView}>
                  <TouchableOpacity 
                    style={Platform.OS === 'ios' ? styles.submitBtn : styles.androidSubmitBtn}
                    onPress={this.correct}
                  >
                    <Text style={styles.submitBtnText}> Correct </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.incorrectBtnView}>
                  <TouchableOpacity 
                    style={Platform.OS === 'ios' ? styles.incorrectBtn : styles.androidIncorrectBtn}
                    onPress={this.incorrect}
                  >
                    <Text style={styles.submitBtnText}> Incorrect </Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-between',
    flex: 1,
  },
  containerResults: {
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-around',
    flex: 1,
  },
  submitBtn: {
    backgroundColor: lightGreen,
    padding: 10,
    borderRadius: 7,
    height: 50,
  },
  androidSubmitBtn: {
    backgroundColor: lightGreen,
    padding: 10,
    borderRadius: 2,
    height: 50,
  },
  incorrectBtn: {
    backgroundColor: lightRed,
    padding: 10,
    borderRadius: 7,
    height: 50,
  },
  androidIncorrectBtn: {
    backgroundColor: lightRed,
    padding: 10,
    borderRadius: 2,
    height: 50,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
  },
  text: {
    color: black,
    fontSize: 25,
    textAlign: 'center',
    fontWeight: '400',
    paddingBottom: 10,
    fontFamily: mainFont, 
  },
  textAns: {
    color: black,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '200',
    paddingBottom: 10,
    fontFamily: mainFont, 
  },
  textQuestionCount: {
    color: darkGray,
    fontSize: 15,
    fontWeight: '300',
    paddingTop: 10,
    fontFamily: mainFont, 
  },
  textFlipBtn: {
    color: 'red',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: mainFont, 
  },
  incorrectBtnView: {
    paddingBottom: 60,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  correctBtnView: {
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  removeTxt: {
    paddingTop: 10,
  }
})

function shuffleQuestions(questions) {
  let counter = questions.length

  while (counter > 0) {
    let i = Math.floor(Math.random() * counter)

    counter -= 1

    const temp = questions[counter]
    questions[counter] = questions[i]
    questions[i] = temp
  }

  return questions
}

function mapStateToProps(quizzes, { navigation }) {
  const { title, shuffle } = navigation.state.params
  return {
    questions: shuffle ? shuffleQuestions([...quizzes[title].questions]) : quizzes[title].questions,
    numQuestions: quizzes[title].questions.length,
    goBack: () => navigation.goBack(),
  }
}

function mapDispatchToProps( dispatch ) {
  return {
    deleteQuestion: (data) => dispatch(deleteQuestion(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizCard)
