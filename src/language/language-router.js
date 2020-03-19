const express = require('express')
const LanguageService = require('./language-service')
const LinkedList = require('../helpers/linkedlist')
const { requireAuth } = require('../middleware/jwt-auth')
const bodyParser = express.json()

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })
      
        

      req.language = language
      const wordList = await LanguageService.getWordList(
        words = await LanguageService.getLanguageWords(
          req.app.get('db'),
          req.language.id,
        )
      )
      req.list = wordList
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {

    try {
    const {guess} = req.body
    const stringToCheck = guess

    if(!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }

    const wordToCheck = req.list.head

    let memory = wordToCheck.value.memory_value
    const translation = wordToCheck.value.translation

    if(translation === stringToCheck) {  
      
      req.list.head = req.list.head.next
      console.log('NEW LIST HEAD', req.list)
      memory = memory * 2

      wordToCheck.value.memory_value = memory

      req.list.insertAt(memory, wordToCheck)

      const response = {
        nextWord: req.list.head.value.original,
        totalScore: req.language.total_score + 1,
        wordCorrectCount: wordToCheck.value.correct_count + 1,
        wordIncorrectCount: wordToCheck.value.incorrect_count,
        answer: translation,
        isCorrect: true
      }
      console.log('LIST FROM CORRECT', req.list)
      res.json(response)
      
    }
    else{
      memory = 1

      req.list.head = req.list.head.next
      console.log('NEW LIST HEAD', req.list)

      wordToCheck.value.memory_value = memory

      req.list.insertAt(memory, wordToCheck)

      const response = {
        nextWord: req.list.head.value.original,
        totalScore: req.language.total_score,
        wordCorrectCount: wordToCheck.value.correct_count,
        wordIncorrectCount: wordToCheck.value.incorrect_count + 1,
        answer: translation,
        isCorrect: false
      }
      console.log('LIST FROM INCORRECT', req.list)
      res.json(response)
      
    }
    next()
    } catch(error) {
      next(error)
    }
  })

  languageRouter
    .get('/head', async (req, res, next) => {
        try {
          const currentTotal = await LanguageService.getTotalScore(req.app.get('db'), req.language.id)
          const headWord = req.list.head

          res.json({
            nextWord: headWord.value.original,
            totalScore: currentTotal[0].total_score,
            wordCorrectCount: headWord.value.correct_count,
            wordIncorrectCount: headWord.value.incorrect_count,
          })

          
          next()
        }catch (error) {
          next(error)
        }
    })

module.exports = languageRouter
