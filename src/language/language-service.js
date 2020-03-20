const LinkedList = require('../helpers/linkedlist')

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getLanguageWords2(db, headId) {
    return db
      .from('word')
      .whereNot({ id: headId })
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      ) 
      .orderBy('next')
  },

  getLanguageWordsByNext(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
      .orderBy('next')
  },

  getTotalScore(db, id) {
    return db 
            .from('language')
            .select('total_score')
            .where({ id })
            .first()
  },

  getWordInfo(db, id) {
    return db
      .from('word')
      .select(
          'id',
          'original',
          'translation',
          'next',
          'memory_value',
          'correct_count',
          'incorrect_count',
      )
      .where({id})
      .first()
  },

  getWordList(words) {
    const wordList = new LinkedList()
    words.forEach(word => wordList.insertLast(word))
    return wordList
  },

  async populateArr (db, headWord, otherWords){
    const finalArr =[];
    finalArr.push(headWord);
    for(let i=0; i<otherWords.length-1; i++) {
      if(i === 0){
        finalArr.push(otherWords[i])
      }
      const nextWord = await this.getNextWord(db, otherWords[i])
      finalArr.push(nextWord)
    }
    return finalArr;
  },

  getNextWord(db, currWord){
    while(currWord.next !== null){
      const nextId = currWord.next
      return db('word')
        .select('*')
        .where({id: nextId})
        .first()
    }
    return;
  },

  updateLanguage(db, langId, totalScore, newHeadId){
    return db('language')
      .where({id: langId})
      .first()
      .update({total_score: totalScore, head: newHeadId})
      .then(rows => {
        return rows[0];
      });
  },

  updateCorrectWord(db, wordId, memValue, correct, next) {
    return db('word')
      .where({id: wordId})
      .first()
      .update({memory_value: memValue, correct_count: correct, next})
      .then(rows => {
        return rows[0];
      });
  },

  updatePrevWord(db, id, next) {
    return db('word')
      .where({id})
      .first()
      .update({next})
      .then(rows => {
        return rows[0];
      });
  },

  updateIncorrectWord(db, wordId, memValue, incorrect, next) {
    return db('word')
      .where({id: wordId})
      .first()
      .update({memory_value: memValue, incorrect_count: incorrect, next})
      .then(rows => {
        return rows[0];
      });
  },

  getHeadId(db, langId){
    return db 
      .from('language')
      .select('head')
      .where({id: langId})
      .first()
  },

}


module.exports = LanguageService