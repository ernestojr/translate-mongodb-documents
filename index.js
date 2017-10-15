const TranslateDocs = module.exports = class Translate {
  constructor(sOrigin, sFinal, models) {
    if (!models || !Array.isArray(models) || (models.length === 0)) {
      throw new Error('Models to translate has not been specified.')
    }
    if (!sOrigin) {
      throw new Error('String connection origin has not been specified.')
    }
    if (!sFinal) {
      throw new Error('String connection final has not been specified.')
    }
    this._models = models
    this._sOrigin = sOrigin
    this._sFinal = sFinal
  }

  async start() {
    this._dbs = await connectToMongo([this._sOrigin, this._sFinal])
    return Promise.all(this._models.map(async (tData) => {
      const [oData, fData] = tData
      const { translate } = fData
      const [oModel, fModel] = createModels(this._dbs, tData)
      let docs = await oModel.find(oData.criteria || {})
      docs = docs.map(doc => {
        if (translate) {
          return translate(doc)
        } else throw new Error('Translate method not found.')
      })
      return fModel.create(docs)
    }))
  }

  disconnect() {
    this._dbs.map(db => {
      db.disconnect()
    })
  }

}
function startConnection(stringConnect) {
  const mongoose = require('mongoose')
  mongoose.Promise = global.Promise
  return new Promise(function(resolve, reject) {
    mongoose.connect(stringConnect, { useMongoClient: true }, function(err) {
      if (err) return reject(err)
      resolve(mongoose)
    })
  })
}

async function connectToMongo(stringsConnect = []) {
  return await Promise.all(stringsConnect.map(sConnect => {
    return startConnection(sConnect)
  }))
}

function createModels([oDB, fDB], [oData, fData]) {
  return [
    oDB.model('O' + oData.name, oData.schema, oData.collectionName),
    fDB.model('F' + fData.name, fData.schema, fData.collectionName)
  ]
}
