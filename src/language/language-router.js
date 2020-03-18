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
  .get('/head', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      const wordList = new LinkedList()

      words.forEach(word => wordList.insertLast(word.original))
      console.log(wordList)
      
      const currentTotal = await LanguageService.getTotalScore(req.app.get('db'), req.language.id)
      const headWord = words.find(w => w.language_id === req.language.id)
      const wordDetails =  await LanguageService.getWordInfo(req.app.get('db'), headWord.id)
    
      res.json({
        nextWord: wordDetails[0].original,
        totalScore: currentTotal[0].total_score,
        wordCorrectCount: wordDetails[0].correct_count,
        wordIncorrectCount: wordDetails[0].incorrect_count,
      })
      next()
    }catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {

    try {
    const {guess, id} = req.body
    const stringToCheck = guess
    const wordId = id

    if(!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }

    const list = await LanguageService.getWordList(
      words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
    )
      
    const wordToCheck = await LanguageService.getWordInfo(
      req.app.get('db'),
      wordId,
    )

    if(wordToCheck[0].translation === stringToCheck) {  
      list.head = list.head.next
      list.insertAt(2, wordToCheck[0].original)
      console.log('list', list)
    }
    else{
      list.head = list.head.next
      list.insertAt(1, wordToCheck[0].original)
      console.log('list', list)
    }

    res.send('implement me')
    }
    catch(error) {
      next(error)
    }
  })

module.exports = languageRouter
