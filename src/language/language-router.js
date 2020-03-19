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

      console.log('WORD LIST!!', JSON.stringify(wordList) )
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
    //get users guess from the request body and set it to a variable
    const {guess} = req.body
    const stringToCheck = guess

    //check it there is no guess in the body
    if(!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }

    //set a variable to the head node of the LL to check the guess against
    const wordToCheck = req.list.head

    //memory value of the word to check 
    let memory = wordToCheck.value.memory_value
    //translation of the word to check
    const translation = wordToCheck.value.translation

    if(translation === stringToCheck) {  
      
      req.list.head = req.list.head.next
      console.log('NEW LIST HEAD', req.list)
      memory = memory * 2

      wordToCheck.value.memory_value = memory;
      wordToCheck.value.correct_count = wordToCheck.value.correct_count + 1;

      req.list.insertAt(memory, wordToCheck.value)

      const prevNode = req.list._findNthElement(memory-1)
      console.log(prevNode, 'Previous Node')
      const newNode = req.list._findNthElement(memory)
      console.log(newNode, 'New Node')

      const response = {
        nextWord: req.list.head.value.original,
        totalScore: req.language.total_score + 1,
        wordCorrectCount: wordToCheck.value.correct_count,
        wordIncorrectCount: wordToCheck.value.incorrect_count,
        answer: translation,
        isCorrect: true
      }
      // console.log('LIST FROM CORRECT', req.list)

      const newNext = newNode.next.value.id ? newNode.next.value.id : null
      //update the correct word in the database 
      LanguageService.updateCorrectWord(
        req.app.get('db'),
        wordToCheck.value.id,
        memory, 
        wordToCheck.value.correct_count, 
        //next value of the node after it is inserted in the LL
        newNext
      )

      LanguageService.updatePrevWord(
        req.app.get('db'),
        prevNode.value.id,
        newNode.value.id
      )

      //update the total score and the head in the language table 
      LanguageService.updateLanguage(
        req.app.get('db'),
        req.language.id,
        //how to increment the total score ?
        req.language.total_score + 1,
        req.list.head.value.id
      )

      res.json(response)
      
    }
    else{
      memory = 1
      

      req.list.head = req.list.head.next
      console.log('NEW LIST HEAD', req.list)

      wordToCheck.value.memory_value = memory
      wordToCheck.value.incorrect_count = wordToCheck.value.incorrect_count + 1;

      req.list.insertAt(memory, wordToCheck.value)

      const prevNode = req.list._findNthElement(memory)
      const newNode = req.list._findNthElement(memory+1)

      const response = {
        nextWord: req.list.head.value.original,
        totalScore: req.language.total_score,
        wordCorrectCount: wordToCheck.value.correct_count,
        wordIncorrectCount: wordToCheck.value.incorrect_count,
        answer: translation,
        isCorrect: false
      }
      console.log('LIST FROM INCORRECT', req.list)

      const newNext = newNode.next.value.id ? newNode.next.value.id : null

      LanguageService.updateIncorrectWord(
        req.app.get('db'),
        wordToCheck.value.id,
        1, 
        wordToCheck.value.incorrect_count, 
        //next value of the node after it is inserted in the LL
        newNext
      )

      LanguageService.updatePrevWord(
        req.app.get('db'),
        prevNode.value.id,
        prevNode.next.value.id
      )

      LanguageService.updateLanguage(
        req.app.get('db'),
        req.language.id,
        req.language.total_score,
        req.list.head.value.id
      )
      res.json(response)
      
    }
    next()
    } catch(error) {
      next(error)
    }
  })

  languageRouter
    .get('/head', async (req, res, next) => {

      //all outside of the try block for now for us to test the below (getting the head node form the db instead from the LL)
      try {
        const currentTotal = await LanguageService.getTotalScore(req.app.get('db'), req.language.id)

      const headId = await LanguageService.getHeadId(
        req.app.get('db'),
        req.language.id)
      console.log(headId, 'headId')
        
      const headWord = await LanguageService.getWordInfo(
        req.app.get('db'),
        headId.head)
      console.log(headWord, 'head word')

        res
          .status(200)
          .json({
            nextWord: headWord.original,
            totalScore: currentTotal.total_score,
            wordCorrectCount: headWord.correct_count,
            wordIncorrectCount: headWord.incorrect_count
          })

        next()
      } catch (error) {
        next(error)
      }
      

//--------------------------------------------------------------
        
        // try {
        //   const currentTotal = await LanguageService.getTotalScore(req.app.get('db'), req.language.id)
        //   const headWord = req.list.head

        //   res.json({
        //     nextWord: headWord.value.original,
        //     totalScore: currentTotal.total_score,
        //     wordCorrectCount: headWord.value.correct_count,
        //     wordIncorrectCount: headWord.value.incorrect_count,
        //   })

          
        //   next()
        // }catch (error) {
        //   next(error)
        // }
    })

module.exports = languageRouter
