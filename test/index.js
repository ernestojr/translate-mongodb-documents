const Translate = require('../index.js')
const Fakerator = require('fakerator')
const expect = require('chai').expect
const mongoose = require('mongoose')
const fakerator = Fakerator("es-ES")
const stringConn = 'mongodb://localhost/translate'

mongoose.Promise = global.Promise
mongoose.connect(stringConn, { useMongoClient: true })

const userSchema = {
  firstName: { type: String },
  lastName: { type: String },
  address: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}
const simpleUserSchema = {
  fullName: { type: String },
  address: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date }
}

const User = mongoose.model('User', userSchema, 'user')
const SimpleUser = mongoose.model('SimpleUser', simpleUserSchema, 'simpleUser')

function translate(doc) {
  const { address, createdAt } = doc
  return { fullName: `${doc.firstName} ${doc.lastName}`, address, createdAt }
}

const models = [
  [
    {
      name: 'User', collectionName: 'user', schema: userSchema, criteria: {}
    },
    {
      name: 'SimpleUser', collectionName: 'simpleUser', schema: simpleUserSchema, translate
    }
  ]
]

let iTranslate

describe('Translate documents mongo Test', () => {
  before(actionBefore)
  after(actionAfter)

  it('Should create instance of Translate', () => {
    iTranslate = new Translate(stringConn, stringConn, models)
  })

  it('Should translate al documents defined in models', async () => {
    const results = await iTranslate.start()
    results.map(sUsers => {
      sUsers.map( sUser => {
        expect(sUser).to.have.property('fullName')
        expect(sUser).to.have.property('address')
        expect(sUser).to.have.property('createdAt')
      })
    })
  })

})

async function actionBefore() {
  const promises = []
  for (var i = 0; i < 25; i++) {
    promises.push(User.create({
      firstName: fakerator.names.firstName(),
      lastName: fakerator.names.lastName(),
      address: fakerator.entity.address(),
    }))
  }
  await Promise.all(promises)
}

async function actionAfter() {
  await User.remove({})
  await SimpleUser.remove({})
  iTranslate.disconnect()
}
