import { Readable, Transform } from 'node:stream'

const readable = Readable({
  read() {
    const fakeData = [
      '<tag>toy-api</tag>',
      '<tag>node-webwo',
      'rkers-demo</tag>',
      '<tag>points-',
      'of-',
      'interest</tag>',
      '<tag>',
      'processing',
      '-large-',
      'files</tag>',
      '<tag>',
      'todo-app',
      '</tag>',
      '<tag>ts-book</tag>'
    ]
    // const fakeData = [
    //   '<othertag><tag>toy-api</tag></othertag><tag>fs</tag>',
    //   '<tag>node-webwo',
    //   'rkers-demo</tag>',
    //   '<tag>points-',
    //   'of-',
    //   'interest</tag><tag>',
    //   'processing',
    //   '-large-',
    //   'files</tag><tag>nodejs-patterns</tag><tag>concurrency-patterns</tag>',
    //   '<tag>v1</tag><tag>v2</tag><tag>v3</tag>',
    //   '<tag>',
    //   'todo-app',
    //   '</tag><tag>ts',
    //   '-book</tag><tag>python-api</tag>'
    // ]
    fakeData.forEach(str => this.push(str))
    this.push(null)
  }
})

const doSomething = (value) => {
  console.log('data - ', value.toString())
}

const tagsFrom = (tagName) => [`<${tagName}>`, `</${tagName}>`]

const closingTagsPositions = (buf, tag) => {
  const [openTag, closeTag] = tagsFrom(tag)
  return [buf.indexOf(openTag), buf.indexOf(closeTag)]
}

const tag = 'tag'
let holder = Buffer.from('')
const reduce = (chunk) => {
    readable.pause()

    holder = Buffer.concat([holder, chunk])
    let [init, end] = closingTagsPositions(holder, tag)

    while (init > -1 && end > -1) {
      const data = holder.subarray(init, end + 6)
      holder = holder.subarray(end + 6)
      doSomething(data)
      const aux = closingTagsPositions(holder, tag)
      init = aux[0]
      end = aux[1]
    }

    readable.resume()
}

readable.on('data', reduce)

readable.on('end', _ => {
  console.log('end')
  console.log(holder, 'holder')
})