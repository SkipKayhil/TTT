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
  const getTurn = setupTurnBoolean();

  getElementArray('tile').forEach((tile) => {
    tile.onclick = () => tileClicked(aiSetting, getTurn, tile.id);
    tile.className = 'tile empty enabled';

    while (tile.firstChild) tile.removeChild(tile.firstChild);
  });

  if (aiSetting === 'x') doAITurn(getTurn);
}

// Closure that holds the state of the current turn
function setupTurnBoolean () {
  var turns = true;

  return () => {
    turns = !turns;
    return turns ? 'o' : 'x';
  };
}

function getOtherPlayer (currentTurn) {
  return currentTurn === 'x' ? 'o' : 'x';
}

function tileClicked (aiSetting, getTurn, tileID) {
  const tile = document.getElementById(tileID);
  const player = getTurn();
  const check = checkWin(getIdArray(player), [tileID]);
  // if state gets added here, print it out, i.e. [x tiles], [y tiles]
  console.log(player + ' clicked on ' + tileID);

  tile.className = tile.className.replace('empty enabled', player);
  tile.onclick = () => {};
  if (check) {
    //setTilesAsWon(player, check);
    console.log(player + ' has won!');

    check.forEach((tile) => {
      document.getElementById(tile).className += ' win';
    });

    gameOver(aiSetting);
  } else if (getElementArray('empty').length === 0) {
    gameOver(aiSetting);
  } else if (getOtherPlayer(player) === aiSetting) {
    doAITurn(getTurn, aiSetting);
  }
}

function doAITurn (getTurn, aiPlayer, currentAIMode) {
  tileClicked(aiPlayer, getTurn, getHardAITurn(aiPlayer));
}

function getEasyAITurn () {
  const rand = Math.floor(Math.random() * 9) + 1;

  return document.getElementById(rand).className.includes('empty')
    ? rand
    : getEasyAITurn();
}

function getMedAITurn (aiPlayer) {
  // try to Win
  const winningMove = findThirdTile(getIdArray(aiPlayer));
  if (winningMove != null) return winningMove;

  // try to not lose
  const blockingMove = findThirdTile(getIdArray(getOtherPlayer(aiPlayer)));
  if (blockingMove != null) return blockingMove;

  // else random
  console.log('this turn is random');
  return getEasyAITurn();

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

function getHardAITurn (player) {
  // Skynet came online 2016/11/19 at 19:43:07
  if (document.getElementsByClassName('empty').length === 9) {
    // if every tile is empty, pick a random corner
    return pickRandomCorner();
  } else if (document.getElementsByClassName('empty').length === 8) {
    return document.getElementById(5).className.includes('empty')
      ? 5
      : pickRandomCorner();
  } else {
    const allMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const currentGameTree = getStateChildren(
      allMoves.filter(
        x => document.getElementById(x).className.includes('empty')
      ), getIdArray(getOtherPlayer(player)), getIdArray(player), 0);
// TODO: refactor getStateChildren to return the key so it can be used here
      // console.log(currentGameTree)
    var finalTurn;
    var finalScore = true;
    for (var key in currentGameTree.children) {
      const possibleTurn = currentGameTree.children[key];
      if (finalScore === true ||
        (player === 'x' && possibleTurn.score > finalScore) ||
        (player === 'o' && possibleTurn.score < finalScore) ||
        (possibleTurn.score === finalScore && Math.floor(Math.random() * 2) === 1)) {
        // console.log(possibleTurn + ''s score is ' + possibleTurn.score + ' and is less than ' + finalScore)
        finalTurn = key;
        finalScore = possibleTurn.score;
      }
    }
    return finalTurn;
  }

  function pickRandomCorner () {
    const cornerTiles = [2, 4, 6, 8];
    return cornerTiles[Math.floor(Math.random() * 4)];
  }
}

function getElementArray (className) {
  // This is literally just a wrapper to allow forEach usage.
  // getElementsByClassName returns a NodeList, which doesn't universally
  // support forEach yet.
  return Array.from(document.getElementsByClassName(className));
}

// used to get the tiles of a player... if this gets held
// in the functions state then it becomes unneccessary and cleaner?
function getIdArray (player) {
  return getElementArray(player).map((element) => {
    return element.id;
  });
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
  getElementArray('menu-item').forEach(setting =>
    setting.className = setting.className.replace(' selected', '')
  );
  document.getElementById('ai-' + aiSetting).className += ' selected';
  console.log('AI is ' + aiSetting);

  toggleSettingsMenu();
  setupGame(aiSetting);
}
