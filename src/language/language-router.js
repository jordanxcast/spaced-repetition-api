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
  .post('/guess', bodyParser, async (req, res, next) => {

    try {
    //get users guess from the request body and set it to a variable
    const {guess} = req.body
    const stringToCheck = guess

    //find the word set as the head in language table so that it'll be inserted into the ll first
    const headId = await LanguageService.getHeadId(
      req.app.get('db'), req.language.id
    )
    const headWord = await LanguageService.getWordInfo(
      req.app.get('db'), headId.head
    )
    
    //retrieves all other words besides the designated head word, ordered by their "next" attribute
    const otherWordsArr = await LanguageService.getLanguageWords2(
      req.app.get('db'), headId.head
    )

    //inserts head word and otherWordsArr into another array
    const wordsArr = await LanguageService.populateArr(
      req.app.get('db'),
      headWord, 
      otherWordsArr)

    //sends wordsArr and constructs linked list that is used to determine the word order
    const wordList = await LanguageService.getWordList(
      wordsArr
    )

    //check it there is no guess in the body
    if(!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }

    //set a variable to the head node of the LL to check the guess against
    const wordToCheck = wordList.head //pull from db

    //memory value of the word to check 
    let memory = wordToCheck.value.memory_value
    //translation of the word to check
    const translation = wordToCheck.value.translation

    //if user's guess is correct, move word in linked list by its memory value * 2 and update db accordingly
    if(translation === stringToCheck) {
      wordList.head = wordList.head.next
  
      memory = memory * 2

      wordToCheck.value.memory_value = memory;
      wordToCheck.value.correct_count = wordToCheck.value.correct_count + 1;

      wordList.insertAt(memory, wordToCheck.value)

      const prevNode = wordList._findNthElement(memory-1)
      
      const newNode = wordList._findNthElement(memory)

      const response = {
        nextWord: wordList.head.value.original,
        totalScore: req.language.total_score + 1,
        wordCorrectCount: wordToCheck.value.correct_count,
        wordIncorrectCount: wordToCheck.value.incorrect_count,
        answer: translation,
        isCorrect: true
      }

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
        wordList.head.value.id
      )



      res.json(response)
    }

    //if user's guess is incorrect, reset word's memory value to 1, move it back in list by 1, and update db accordingly
    else{
      memory = 1
      

      wordList.head = wordList.head.next

      wordToCheck.value.memory_value = memory
      wordToCheck.value.incorrect_count = wordToCheck.value.incorrect_count + 1;

      wordList.insertAt(memory, wordToCheck.value)

      const prevNode = wordList._findNthElement(memory)
      const newNode = wordList._findNthElement(memory+1)

      const response = {
        nextWord: wordList.head.value.original,
        totalScore: req.language.total_score,
        wordCorrectCount: wordToCheck.value.correct_count,
        wordIncorrectCount: wordToCheck.value.incorrect_count,
        answer: translation,
        isCorrect: false
      }

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
        wordList.head.value.id
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

      try {
        const currentTotal = await LanguageService.getTotalScore(req.app.get('db'), req.language.id)

      const headId = await LanguageService.getHeadId(
        req.app.get('db'),
        req.language.id)
        
      const headWord = await LanguageService.getWordInfo(
        req.app.get('db'),
        headId.head)
      
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
      
    })

module.exports = languageRouter
