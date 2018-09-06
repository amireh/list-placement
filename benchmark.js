const { rearrangeList } = require('./index.js')
const itemCount = 100000;
const input = []

for (let i = 0; i < itemCount; ++i) {
  input.push({ id: `item_${i}` })
}

rearrangeList({ orderKey: 'position', idKey: 'id' }, input)
