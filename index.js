const POS_AT = 'at';
const POS_AFTER = 'after';
const POS_BEFORE = 'before';

const ERR_INVALID_SPECIFIER = 'ERR_INVALID_SPECIFIER';
const PLACEHOLDER_EL = {};

exports.rearrangeList = function rearrangeList() {
  return exports.rearrangeListWithErrors.apply(null, arguments).list;
};

exports.rearrangeListWithErrors = function rearrangeListWithErrors({ orderKey, idKey }, list) {
  const errors = [];
  const idIndex = indexBy(idKey, list)
  const specs = list.reduce(function(map, element, index) {
    const elementPlacements = listOf(element[orderKey])
    const id = element[idKey]

    elementPlacements.map(mapToTuple).forEach(([ type, parameter ]) => {
      switch (type) {
        case POS_AT:
          pushIn(id, parameter, map);

          break;

        case POS_AFTER:
          if (idIndex[parameter]) {
            pushIn(id, { after: true, parameter }, map);
          }

          break;

        case POS_BEFORE:
          if (idIndex[parameter]) {
            pushIn(id, { before: true, parameter }, map);
          }

          break;

        default:
          errors.push([ ERR_INVALID_SPECIFIER, type ])
      }
    })

    // fallback to the occurrence index
    pushIn(id, index, map)

    return map
  }, {})

  const placements = deanchorize(specs)
  const withoutConflicts = reconcileContestants(placements)

  return {
    errors,
    list: compact(applyPlacements(withoutConflicts, list, idIndex)),
  }
}

const deanchorize = abstracts => {
  const resolvePositionOf = targetId => {
    return abstracts[targetId].reduce(function(winningPlacement, placement) {
      // short-circuit
      if (winningPlacement !== undefined) {
        return winningPlacement;
      }
      else if (typeof placement === 'number') {
        return placement;
      }
      else if (placement.after === true) {
        return resolvePositionOf(placement.parameter) + 1;
      }
      else if (placement.before === true) {
        return resolvePositionOf(placement.parameter) - 1;
      }
    }, undefined)
  }

  return Object.keys(abstracts).reduce(function(map, id) {
    map[id] = resolvePositionOf(id);
    return map;
  }, {})
}

const reconcileContestants = placements => {
  const orderedList = Object.keys(placements)
    .map((id) => [ id, placements[id] ])
    .sort((a,b) => a[1] > b[1] ? 1 : -1)
  ;

  // we have to account for negative indices which occur when using :before
  // positioning; consider
  //
  //     [
  //       { id: 'b', before: 'a' },
  //       { id: 'a', at: 0 }
  //     ]
  //
  // b would be assigned -1, so we will use the lowest index as the initial
  // shift amount
  const startingIndex = Math.min.apply(Math, orderedList.map(x => x[1]).concat(0))

  const { elements: reconciled } = orderedList.reduce((state, [ id, position ]) => {
    const { shift } = state;
    const positionTaken = targetPosition => state.indices[targetPosition] === true;
    const designatedPosition = position + shift;

    if (positionTaken(designatedPosition)) {
      state.shift += 1
      state.elements[id] = designatedPosition + 1
    }
    else {
      state.elements[id] = designatedPosition
    }

    state.indices[state.elements[id]] = true;

    return state;
  }, { shift: Math.abs(startingIndex), elements: {}, indices: {} })

  return reconciled;
}

const applyPlacements = (placements, list, idIndex) => {
  return Object.keys(placements).reduce(function(ordered, id) {
    ordered[placements[id]] = idIndex[id];
    return ordered;
  }, Array(list.length).fill(PLACEHOLDER_EL));
}

const listOf = x => Array.isArray(x) ? x : [].concat(x || []);

const indexBy = (key, list) => list.reduce(function(map, el) {
  map[el[key]] = el;
  return map;
}, {})

const pushIn = (key, value, map) => {
  if (!map.hasOwnProperty(key)) {
    map[key] = []
  }

  map[key].push(value)

  return map
}

const mapToTuple = map => {
  const key = Object.keys(map)[0]
  return [ key, map[key] ]
}

const compact = list => list.filter(x => x !== PLACEHOLDER_EL)
