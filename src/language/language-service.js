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

  getTotalScore(db, id) {
    return db 
            .from('language')
            .select('total_score')
            .where({ id })
  },

  getWordInfo(db, id) {
    return db
            .from('word')
            .select(
                'id',
                'original',
                'correct_count',
                'incorrect_count'
            )
            .where({id})
  }
}

module.exports = LanguageService
