// TODO:
// - Ensure game looks nice in landscape mode -> move to Grid instead of flex?
// - Refactor getHardAITurn to use getStateChildren better
//    - make getStateChildren return best move instead of children
//    - possibly have it return [tile, score] so that both can be used?
//    - additional optimizations to getStateChildren
//      - use only [] instead of {}
//      - be more efficient (whats kept on stack, passed down, etc.)
//      - add tests so that the debug information isn't needed
//      - restructure method: return [tile, score] as described above
// - Add functionality to set AI difficulty (Easy, Good, Hard)
// - Refactor variables so code is more readable/clean up code
// - Add safari prefixes?
// - Add mobile touch support
// - make the tileIDs rotate so gameTree is only 4/9ths the size
// - possibly don't overwrite tile.onclick, just enable/disable?
//    - either way every tile needs to be iterated and enabled so it doesn't matter?
'use strict';

function getStateChildren (tilesLeft, playerTiles, opponentTiles, tileID) {
  var turn = {};
  turn.tileID = tileID;
  turn.score = true;

  const depth = playerTiles.length + opponentTiles.length;
  const player = depth % 2 === 1 ? 'x' : 'o';

  // check for player win
  // console.log(playerTiles, tileID)
  if (checkWin(playerTiles.slice(0, -1), playerTiles.slice(-1))) {
    turn.score = (10 - depth) * (player === 'x' ? 1 : -1);
  } else if (depth === 9) {
    // if the depth is 9 and not a win, then its a tie
    turn.score = 0;
  } else {
    turn.children = {};
    tilesLeft.forEach((tile) => {
      turn.children[tile] = getStateChildren(
        tilesLeft.filter(x => x !== tile),
        opponentTiles.concat(tile),
        playerTiles,
        tile
      );
      if (turn.score === true ||
        (player === 'x' && turn.children[tile].score < turn.score) ||
        (player === 'o' && turn.children[tile].score > turn.score)) {
        turn.score = turn.children[tile].score;
      }
    });
  }
  return turn; // currently returning the children, goal: return best child?
}

window.addEventListener('load', () => {
  setupGame('off');
});

function setupGame (aiSetting) {
  const defaultState = {
    x: [],
    o: [],
    turns: 0,
    nextPlayer: 'x',
    ai: aiSetting
  };
  const tileClicked = setupGameState(defaultState, aiSetting);

  getElementArray('tile').forEach((tile) => {
    tile.onclick = () => tileClicked(parseInt(tile.id));
    tile.className = 'tile empty enabled';

    while (tile.firstChild) tile.removeChild(tile.firstChild);
  });

  if (aiSetting === 'x') doAITurn(tileClicked, defaultState);
}

function getOtherPlayer (currentTurn) {
  return currentTurn === 'x' ? 'o' : 'x';
}

function setupGameState (defaultState, aiSetting) {
  let state = defaultState;

  return function tileClicked (tileID) {
    const tile = document.getElementById(tileID);
    const player = state.nextPlayer;
    const check = checkWin(state[player], [tileID]);

    state = {
      ...state,
      [player]: [...state[player], tileID],
      turns: state.turns + 1,
      nextPlayer: player === 'x' ? 'o' : 'x'
    };

    console.log(player + ' clicked on ' + tileID);
    console.log('State:', state);

    tile.className = tile.className.replace('empty enabled', player);
    tile.onclick = () => {};
    if (check) {
      console.log(player + ' has won!');

      check.forEach((tile) => {
        document.getElementById(tile).className += ' win';
      });

      gameOver(state.ai);
    } else if (state.turns === 9) {
      gameOver(state.ai);
    } else if (state.nextPlayer === state.ai) {
      doAITurn(tileClicked, state);
    }
  }
}

function doAITurn (tileClicked, state, currentAIMode) {
  tileClicked(getHardAITurn(state));
}

function getEasyAITurn ({x, o}) {
  const rand = Math.floor(Math.random() * 9) + 1;

  return !x.includes(rand) && !o.includes(rand)
    ? rand
    : getEasyAITurn({x, o});
}

function getMedAITurn ({ai, ...state}) {
  // try to Win
  const winningMove = findThirdTile(state[ai]);
  if (winningMove != null) return winningMove;

  // try to not lose
  const blockingMove = findThirdTile(state[getOtherPlayer(ai)]);
  if (blockingMove != null) return blockingMove;

  // else random
  console.log('this turn is random');
  return getEasyAITurn(state);

  function findThirdTile (squareArr) {
    if (squareArr.length < 2) return null;
    for (var i = 0; i < squareArr.length - 1; i++) {
      for (var j = i + 1; j < squareArr.length; j++) {
        const id = 15 - squareArr[i] - squareArr[j];
        if (id > 0 && id < 10 &&
          document.getElementById(id).className.includes('empty')) {
          return id;
        }
      }
    }
  }
}

function getHardAITurn ({turns, ai, ...state}) {
  // Skynet came online 2016/11/19 at 19:43:07
  if (turns === 0) {
    return pickRandomCorner(); // if every tile is empty, pick a random corner
  } else if (turns === 1) {
    return !state.x.includes(5) && !state.o.includes(5)
      ? 5 // if ai is 'o', try going in the middle
      : pickRandomCorner(); // if the middle is taken, then take a corner
  } else {
    const allMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const currentGameTree = getStateChildren(
      allMoves.filter(
        move => !state.x.includes(move) && !state.o.includes(move)
      ), state[getOtherPlayer(ai)], state[ai], 0);
// TODO: refactor getStateChildren to return the key so it can be used here
    // console.log(currentGameTree)
    var finalTurn;
    var finalScore = true;
    for (var key in currentGameTree.children) {
      const possibleTurn = currentGameTree.children[key];
      if (finalScore === true ||
        (ai === 'x' && possibleTurn.score > finalScore) ||
        (ai === 'o' && possibleTurn.score < finalScore) ||
        (possibleTurn.score === finalScore && Math.floor(Math.random() * 2) === 1)) {
        // console.log(possibleTurn + ''s score is ' + possibleTurn.score + ' and is less than ' + finalScore)
        finalTurn = key;
        finalScore = possibleTurn.score;
      }
    }
    return parseInt(finalTurn);
  }

  function pickRandomCorner () {
    return (Math.floor(Math.random() * 4) + 1) * 2;
  }
}

function getElementArray (className) {
  // This is literally just a wrapper to allow forEach usage.
  // getElementsByClassName returns a NodeList, which doesn't universally
  // support forEach yet.
  return Array.from(document.getElementsByClassName(className));
}

function checkWin (numbers, partial) {
  //  Goal: return array of winning tile values
  //  if there are no winning values, return false
  var sum;
  var winningTiles = [];

  partial = partial || [];

  sum = partial.reduce((a, b) => {
    return parseInt(a, 10) + parseInt(b, 10);
  }, 0);

  if (sum === 15 && partial.length === 3) return partial;

  if (sum >= 15 || partial.length > 2) return false;

  for (var i = 0; i < numbers.length; i++) {
    const n = numbers[i];
    const remaining = numbers.slice(i + 1);
    const check = checkWin(remaining, partial.concat([n]));
    if (check) {
      check.forEach((winningTile) => {
        if (winningTiles.indexOf(winningTile) === -1) {
          winningTiles = winningTiles.concat(winningTile);
        }
      });
    }
  }
  return winningTiles.length === 0
    ? false
    : winningTiles;
}

// Possibly deprecate this, it's only used once
function gameOver (aiSetting) {
  getElementArray('tile').forEach((tile) => {
    if (tile.id === '5') {
      tile.onclick = () => { setupGame(aiSetting); };

      tile.appendChild(document.createElement('DIV').appendChild(
        document.createTextNode('NEW GAME')));

      if (!tile.className.includes('enabled')) tile.className += ' enabled';
    } else {
      tile.onclick = () => {};
      tile.className = tile.className.replace(' enabled', '');
      if (!tile.className.includes('win')) tile.className += ' disabled';
    }
  });
}

function toggleSettingsMenu () {
  document.getElementById('settings').className =
    document.getElementById('settings').className === 'hidden'
      ? 'visible'
      : 'hidden';
}

function settingClicked (aiSetting) {
  console.log('AI is ' + aiSetting);
  toggleSettingsMenu();
  setupGame(aiSetting);
}
