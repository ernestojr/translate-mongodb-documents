require('dotenv').config()
process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

const sOrigin = process.env.ORIGIN_MONGODB_URI
const sFinal = process.env.FINAL_MONGODB_URI

if (!sOrigin) {
  throw new Error('The variable ORIGIN_MONGODB_URI has not been specified.')
}

if (!sFinal) {
  throw new Error('The variable FINAL_MONGODB_URI has not been specified.')
}

function startConnection(stringConnect) {
  const mongoose = require('mongoose')
  mongoose.Promise = global.Promise
  return new Promise(function(resolve, reject) {
    mongoose.connect(stringConnect, { useMongoClient: true }, function(err) {
      if (err) return reject(err)
      console.log(`Connected to ${stringConnect}`)
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

async function runTranslate([oDB, fDB], models) {
  return await Promise.all(models.map(tData => {
    const [oData, fData] = tData
    const [oModel, fModel] = createModels([oDB, fDB], tData)
    const criteria = oData.criteria || {}
    const docs = (await oModel.find(criteria)).map(doc => {
      if (oModel.translate) {
        return oModel.translate(doc)
      } else throw new Error('Translate method not found.')
    })
    return await fModel.create(docs)
  }))
}

(async function() {
  const result = await connectToMongo([sOrigin, sFinal])
  console.log('Result:', result)
})().catch(error => console.error(error.stack))
