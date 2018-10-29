// TODO:
// - Ensure game looks nice in landscape mode -> move to Grid instead of flex
// - Change checkwin to only check tiles in last move's row/col/(diag)
// - Refactor getHardAITurn to use getStateChildren better
//    - additional optimizations to getStateChildren
//      - add tests so that the debug information isn't needed
// - Add functionality to set AI difficulty (Easy, Good, Hard)
// - Refactor variables so code is more readable/clean up code
// - Add safari prefixes?
// - Add mobile touch support
// - make the tileIDs rotate so gameTree is only 4/9ths the size
// - possibly don't overwrite tile.onclick, just enable/disable?
//    - either way every tile needs to be iterated and enabled so it doesn't matter?
'use strict';

(function($, fromId) {
  const dispatch = setupGameState(updateDOM, {
    x: [],
    o: [],
    ai: 'off',
    over: false
  });

  $('.tile').forEach(tile =>
    tile.addEventListener('click', e =>
      dispatch({ type: 'tile', id: +tile.id })
    )
  );

  $('.menu-item').forEach(item =>
    item.addEventListener('click', e =>
      dispatch({ type: 'setting', ai: item.id.replace('ai-', '') })
    )
  );

  fromId('settings-btn').addEventListener('click', e => {
    const menu = fromId('settings');
    menu.classList.remove('hidden');
    window.addEventListener('click', e => menu.classList.add('hidden'), {
      once: true,
      capture: true
    });
  });

  function updateDOM(state, newState, player) {
    if (newState.over && !state.over) {
      fromId('game').classList.add('over');
      newState.winningTiles.forEach(tile => fromId(tile).classList.add('win'));
      if (newState.winningTiles) {
        console.log(player + ' has won!');
      }
    } else if (newState.x.length === 0 && state.x.length !== 0) {
      console.log('RESET BOARD');
      fromId('game').classList.remove('over');
      $('.tile').forEach(tile => (tile.className = 'tile empty'));
    }

    if (newState[player].length > state[player].length) {
      console.log(player + ` clicked on ${newState[player].slice(-1)[0]}`);
      fromId(newState[player].slice(-1)[0]).classList.replace('empty', player);
    }
  }
})(
  document.querySelectorAll.bind(document),
  document.getElementById.bind(document)
);

function getTurnFromState(ai, { x, o }) {
  const [aiTiles, humanTiles] = ai === 'x' ? [x, o] : [o, x];
  return getStateChildren(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => !x.concat(o).includes(i)),
    humanTiles.slice(0, -1),
    aiTiles,
    humanTiles[humanTiles.length - 1]
  ).best;
}

function getStateChildren(empty, playerTiles, opponentTiles, tileID) {
  // let children = [];
  const depth = playerTiles.length + opponentTiles.length + 1;

  if (
    depth > 4 &&
    winWrapper(playerTiles.concat(tileID), tileID % 3, tileID / 3).length > 0
  ) {
    return { score: (10 - depth) * (depth % 2 === 1 ? 1 : -1) };
  } else if (depth === 9) {
    return { score: 0 }; // if the depth is 9 and not a win, then its a tie
  } else {
    const mult = depth % 2 === 1 ? -1 : 1;
    const ret = randomFrom(
      empty.reduce((acc, cur) => {
        const index = empty.indexOf(cur);
        const { score } = getStateChildren(
          empty.slice(0, index).concat(empty.slice(index + 1, empty.length)),
          opponentTiles,
          playerTiles.concat(tileID),
          cur
        );
        // children = children.concat({ score, tileID: cur });
        if (acc.length === 0 || score * mult > acc[0].score * mult) {
          return [{ score, best: cur }];
        } else if (score === acc[0].score) {
          return acc.concat({ score, best: cur });
        } else return acc;
      }, [])
    );
    // ret.children = children;
    return ret;
  }
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getOtherPlayer(currentTurn) {
  return currentTurn === 'x' ? 'o' : 'x';
}

function setupGameState(updateDOM, defaultState) {
  let state = defaultState;

  const getPlayer = ({ x, o }) => (x.length > o.length ? 'x' : 'o');

  return function dispatch(action) {
    const newState = updateState(state, action);

    updateDOM(state, newState, getPlayer(newState));

    state = newState;
    console.log('State:', state);

    if (getOtherPlayer(getPlayer(state)) === state.ai && !state.over) {
      dispatch({ type: 'tile', id: getAITurn()(state) });
    }
  };

  function updateState(state, action) {
    switch (action.type) {
      case 'tile':
        return { ...updateStateTile(state, action), ai: state.ai };
      case 'setting':
        return { ...defaultState, ai: action.ai };
    }

    function updateStateTile(state, { id }) {
      if (state.over) return id === 5 ? defaultState : state;
      else if (state.x.concat(state.o).includes(id)) return state;
      else {
        const player = state.x.length > state.o.length ? 'o' : 'x';
        // const winningTiles = checkWin(state[player], [id]);
        const winningTiles = winWrapper(state[player].concat(id));
        return {
          x: state.x.concat(player === 'x' ? id : []),
          o: state.o.concat(player === 'o' ? id : []),
          over: winningTiles.length > 0 || state.o.length === 4,
          winningTiles
        };
      }
    }
  }
}

function getAITurn(difficulty) {
  switch (difficulty) {
    case 'easy':
      return getEasyAITurn;
    case 'medium':
      return getMedAITurn;
    default:
      return getHardAITurn;
  }
}

function getEasyAITurn({ x, o }) {
  return randomFrom(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => !x.concat(o).includes(i))
  );
}

function getMedAITurn({ ai, ...state }) {
  return (
    findThirdTile(state[ai]) || // try to win
    findThirdTile(state[getOtherPlayer(ai)]) || // try not to lose
    getEasyAITurn(state) // else random
  );

  function findThirdTile(squareArr) {
    if (squareArr.length < 2) return null;
    for (var i = 0; i < squareArr.length - 1; i++) {
      for (var j = i + 1; j < squareArr.length; j++) {
        const id = 15 - squareArr[i] - squareArr[j];
        if (id > 0 && id < 10 && !state.x.concat(state.o).includes(id)) {
          return id;
        }
      }
    }
  }
}

function getHardAITurn({ ai, ...state }) {
  // Skynet came online 2016/11/19 at 19:43:07
  switch (state.x.length + state.o.length) {
    case 0:
      return pickRandomCorner();
    case 1:
      return !state.x.includes(5) && !state.o.includes(5)
        ? 5
        : pickRandomCorner();
    default:
      return getTurnFromState(ai, state);
  }

  function pickRandomCorner() {
    return randomFrom([2, 4, 6, 8]);
  }
}

function getWinningTiles(board, x, y) {
  return [[x, x + 3, x + 6], [3 * y, 3 * y + 1, 3 * y + 2]]
    .concat(x === y ? [[0, 4, 8]] : [])
    .concat(x + y === 2 ? [[2, 4, 6]] : [])
    .reduce(
      (ret, tiles) =>
        ret.concat(
          tiles.every(t => board[t] === board[tiles[0]])
            ? tiles.filter(i => !ret.includes(i))
            : []
        ),
      []
    );
}

function getPlayerWin(playerTiles, x, y) {
  const reduce = tiles => (acc, cur) =>
    acc.concat(
      cur.every(t => tiles.includes(t)) ? cur.filter(i => !acc.includes(i)) : []
    );

  return [[x, x + 3, x + 6], [3 * y, 3 * y + 1, 3 * y + 2]]
    .concat(x === y ? [[0, 4, 8]] : [])
    .concat(x + y === 2 ? [[2, 4, 6]] : [])
    .reduce(reduce(playerTiles), []);
}

function checkWin(numbers, partial = []) {
  const sum = partial.reduce((a, b) => a + b, 0);

  if (sum === 15 && partial.length === 3) return partial;
  else if (sum >= 15 || partial.length > 2) return [];

  return numbers.reduce(
    (a, num) =>
      checkWin(numbers.filter(n => n != num), partial.concat(num))
        .filter(n => !a.includes(n))
        .concat(a),
    []
  );
}

// TODO: delete after conversion is done
function winWrapper(playerTiles) {
  const convert = index => [, 5, 0, 7, 6, 4, 2, 1, 8, 3][index];
  const unconvert = index => [2, 7, 6, 9, 5, 1, 4, 3, 8][index];
  // return checkWin(playerTiles.slice(0, -1), playerTiles.slice(-1));
  return getPlayerWin(
    playerTiles.map(convert),
    convert(playerTiles.slice(-1)[0]) % 3,
    Math.floor(convert(playerTiles.slice(-1)[0]) / 3)
  ).map(unconvert);
}
