import { Readable, Transform } from 'node:stream'

const readable = Readable({
  read() {
    // const fakeData = [
    //   '<tag>toy-api</tag>',
    //   '<tag>node-webwo',
    //   'rkers-demo</tag>',
    //   '<tag>points-',
    //   'of-',
    //   'interest</tag>',
    //   '<tag>',
    //   'processing',
    //   '-large-',
    //   'files</tag>',
    //   '<tag>',
    //   'todo-app',
    //   '</tag>',
    //   '<tag>ts-book</tag>'
    // ]
    const fakeData = [
      '<othertag><tag>toy-api</tag></othertag><tag>fs</tag>',
      '<tag>node-webwo',
      'rkers-demo</tag>',
      '<tag>points-',
      'of-',
      'interest</tag><tag>',
      'processing',
      '-large-',
      'files</tag><tag>nodejs-patterns</tag><tag>concurrency-patterns</tag>',
      '<tag>v1</tag><tag>v2</tag><tag>v3</tag>',
      '<tag>',
      'todo-app',
      '</tag><tag>ts',
      '-book</tag><tag>python-api</tag>'
    ]
    fakeData.forEach(str => this.push(str))
    this.push(null)
  }
})

const tagsFrom = (tagName) => [`<${tagName}>`, `</${tagName}>`]

const closingTagsPositions = (buf, tag) => {
  const [openTag, closeTag] = tagsFrom(tag)
  return [buf.indexOf(openTag), buf.indexOf(closeTag)]
}

let groupedChunks = []
let holder = Buffer.from('')
const transform = Transform({
  transform(chunk, encoding, cb) {
    const data = []
    const tag = 'tag'

    groupedChunks.push(chunk)
    holder = Buffer.concat(groupedChunks)

    // const [openTagPosition, closeTagPosition] = closingTagsPositions(holder, 'tag')
    // if (openTagPosition > -1 && closeTagPosition > -1) {
    let [openTagPosition, closeTagPosition] = closingTagsPositions(holder, 'tag')
    while (openTagPosition > -1 && closeTagPosition > -1) {
      groupedChunks.length = 0
      data.push(holder.subarray(openTagPosition, closeTagPosition + (tag.length + 3)))
      // const remainer = holder.subarray(closeTagPosition + (tag.length + 3))
      // groupedChunks.push(remainer)
      // holder = Buffer.from('')
      const remainer = holder.subarray(closeTagPosition + (tag.length + 3))
      groupedChunks.push(remainer)
      holder = remainer

      const values = closingTagsPositions(holder, 'tag')
      openTagPosition = values[0]
      closeTagPosition = values[1]
    }
    if (data.length) {
      cb(null, Buffer.from(data))
      return
    }
    cb(null, Buffer.alloc(0))
  }
})

readable.pipe(transform).on('data', chunk => {
  console.log('data', chunk.toString())
})

readable.on('end', _ => {
  console.log('end')
  groupedChunks.forEach(c => console.log(c.toString(), 'in grouped chunks'))
  console.log(groupedChunks.length)
  console.log(holder.toString(), 'holder')
})