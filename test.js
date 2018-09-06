const { assert } = require('chai');
const { rearrangeList } = require('./index.js')

describe('placement::rearrangeList', function() {
  const over = rearrangeList.bind(null, { orderKey: 'position', idKey: 'id' });

  describe(':at', function() {
    it('places it at the designated index in a FIFO fashion', function() {
      const arranged = over([
        {
          position: { at: 1 },
          id: 'b'
        },
        {
          position: { at: 0 },
          id: 'a'
        }
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'a', 'b' ])
    })

    it('shifts items based on occurrence order when they compete for the same position', function() {
      const arranged = over([
        {
          position: { at: 0 },
          id: 'b'
        },
        {
          position: { at: 0 },
          id: 'a'
        },
        {
          position: { at: 1 },
          id: 'c'
        },
        {
          position: { at: 0 },
          id: 'd'
        }
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b', 'a', 'd', 'c' ])
    })
  })

  describe(':after', function() {
    it('places it after the designated target', function() {
      const arranged = over([
        {
          position: { after: 'a' },
          id: 'b'
        },
        {
          position: { at: 1 },
          id: 'a'
        }
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'a', 'b' ])
    })

    it('works as a single element', function() {
      const arranged = over([
        {
          position: { after: 'a' },
          id: 'b'
        },
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b' ])
    })
  })

  describe(':before', function() {
    it('places it before the designated target', function() {
      const arranged = over([
        {
          position: { at: 1 },
          id: 'c',
        },
        {
          position: { at: 0 },
          id: 'a'
        },
        {
          position: { before: 'a' },
          id: 'b'
        },
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b', 'a', 'c' ])
    })

    it('can not go below 0', function() {
      const arranged = over([
        {
          position: { at: 0 },
          id: 'a',
        },
        {
          position: { before: 'a' },
          id: 'b'
        },
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b', 'a' ])
    })

    it('works as a single element', function() {
      const arranged = over([
        {
          position: { before: 'a' },
          id: 'b'
        },
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b' ])
    })
  })

  context('given multiple position specifiers...', function() {
    it('chooses the first matching one', function() {
      const arranged = over([
        {
          position: { at: 0, },
          id: 'a'
        },

        {
          position: [{ after: 'non-existent' }, { at: 3, }],
          id: 'b'
        },
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'a', 'b' ])
    })
  })

  context('when no specifier matches...', function() {
    it('places the item at its occurrence index', function() {
      const arranged = over([
        {
          position: { at: 0, },
          id: 'b'
        },
        {
          position: { after: 'non-existent' },
          id: 'a'
        },
        {
          position: null,
          id: 'c'
        }
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b', 'a', 'c' ])
    })
  })

  context('when position is undefined...', function() {
    it('places items at their occurrence index', function() {
      const arranged = over([
        {
          id: 'b'
        },
        {
          id: 'a'
        },
        {
          id: 'c'
        }
      ])

      assert.deepEqual(arranged.map(x => x.id), [ 'b', 'a', 'c' ])
    })
  })
})