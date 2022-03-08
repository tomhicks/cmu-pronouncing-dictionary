const {writeFile} = require('node:fs')
const {request} = require('node:https')
const concat = require('concat-stream')
const {bail} = require('bail')

const endpoint =
  'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict'

request(endpoint, onrequest).end()

/**
 *
 * @param {import("http").IncomingMessage} response
 */
function onrequest(response) {
  response.pipe(concat(onconcat)).on('error', bail)
}

/**
 *
 * @param {Buffer} buffer
 */
function onconcat(buffer) {
  const words = {}

  for (const d of String(buffer).split('\n')) {
    const space = d.indexOf(' ')

    if (space !== -1) {
      words[d.slice(0, space)] = d.slice(space + 1)
    }
  }

  writeFile(
    'index.js',
    '/** @type {{ [word: string]: string }} */\nexports.dictionary = ' +
      JSON.stringify(words, null, 2) +
      '\n',
    bail
  )
}
