# Translate mongodb documents

This module allows to cover the documents of a collection, based on a model A, to another model B. This module uses `mongoose` for data models.
This module uses the `async` and` await` instructions of ES2017. We recommend using node version `v8.4.0`.
Installation:

```
npm i -S translate-mongodb-documents
```
Here's an example of use:

```javascript
const Translate = require('translate-mongodb-documents')
const sC1 = process.env.MONGODB_URI_ORIGIN
const sC2 = process.env.MONGODB_URI_FINAL
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
function translate(doc) {
  const { address, createdAt } = doc
  return { fullName: `${doc.firstName} ${doc.lastName}`, address, createdAt }
}
const models = [
  [
    {
      name: 'User',
      collectionName: 'user',
      schema: userSchema,
      criteria: {}
    },
    {
      name: 'SimpleUser',
      collectionName: 'simpleUser',
      schema: simpleUserSchema,
      translate
    }
  ]
]
(async () => {
    const iTranslate = new Translate(sC1, sC2, models)
    console.log(await iTranslate.start())
})().catch(err => console.error(err))
```
