// TODO: Alright time for some thoughts:
// 1. Refactor variables so code is more readable/clean up code
// 1a.  Make PlayerTurn/AITurn return values instead of DOM elements
// 2. CheckWin should only check if new tile creates win.
// 3b.  Add functionality to set AI difficulty (Easy, Good, Hard
// 5.   Add safari prefixes because apparently webkit has to be special
// 6a.  Add mobile touch support
// X. make the tileIDs rotate so gameTree is only 4/9ths the size
"use strict";

function getStateChildren(tilesLeft, xTiles, oTiles, tileID) {
    var turn = {};
    turn.tileID = tileID;
    turn.score = true;

    const depth = xTiles.length + oTiles.length;
    const player = depth % 2 === 1 ? "x" : "o";
    // These are both unnecessary but make the output more verbose
    //turn.depth = depth;
    //turn.player = player;

    //check for player win
    if (checkWin(player, player === "x" ? xTiles : oTiles) != false) {
        //console.log("win condition: " + xTiles)
        turn.score = (10 - depth) * (player === "x" ? 1 : -1);
    } else if (depth === 9) {
        // if the depth is 9 and not a win, then its a tie
        turn.score = 0;
    } else {
        turn.children = {};
        tilesLeft.forEach((tile) => {
            if (player === "x") {
                turn.children[tile] = getStateChildren(
                    tilesLeft.filter(x => x != tile),
                    xTiles,
                    oTiles.concat(tile),
                    tile
                );
            }
            else {
                turn.children[tile] = getStateChildren(
                    tilesLeft.filter(x => x != tile),
                    xTiles.concat(tile),
                    oTiles,
                    tile
                );
            }
            if (turn.score === true ||
                (player === "x" && turn.children[tile].score < turn.score) ||
                (player === "o" && turn.children[tile].score > turn.score)) {
                turn.score = turn.children[tile].score;
            }
        });
    }
    return turn;
}

window.onload = () => {
    setupViewport();
    setupGame();
}

window.onresize = (event) => {
    setupViewport();
}

function setupViewport() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    var navHeight, gameWidth, gameHeight, footHeight, buttonMargin,
        buttonPadding;

    if (width > height) {       //landscape
        if (width < 960) {          //phone
            navHeight = 48;
            buttonMargin = "0px 12px";
            buttonPadding = "12px";
        } else {                    //tablet
            navHeight = 64;
            buttonMargin = "4px 8px";
            buttonPadding = "16px";
        }
        gameHeight = (height - 2 * navHeight) + "px";
        gameWidth = gameHeight;
    } else {                    //portrait
        if (width < 600) {          //phone
            navHeight = 56;
            buttonMargin = "0px";
            buttonPadding = "16px";
        } else {                    //tablet
            navHeight = 64;
            buttonMargin = "4px 8px";
            buttonPadding = "16px";
        }
        gameWidth = width * .96 + "px";
        gameHeight = width + "px";
    }
    footHeight = navHeight + "px";
    document.getElementById("navbar").style.height = navHeight + "px";
    getElementArray("button").forEach((button) => {
        button.style.margin = buttonMargin;
        button.style.padding = buttonPadding;
    });
    document.getElementById("footer").style.height = footHeight;
    document.getElementById("game").style.width = gameWidth;
    document.getElementById("game").style.height = gameHeight;
}

function setupGame() {
    const getTurn = setupTurnBoolean();

    getElementArray("tile").forEach((tile) => {
        tile.onclick = () => {tileClicked(getTurn, tile.id)};
        tile.className = "tile empty enabled";

        while(tile.firstChild)
            tile.removeChild(tile.firstChild);
    });

    if (getAI() === "x") doAITurn(getTurn);
}

// This closure gets passed around because it resets at the end of the game
function setupTurnBoolean() {
    var turns = true;

    return () => {
        turns = !turns;
        return turns ? "o" : "x";
    }
}

function getOtherPlayer(currentTurn) {
    return currentTurn === "x" ? "o" : "x";
}

function tileClicked(getTurn, tileID) {
    const tile = document.getElementById(tileID);
    console.log(oldGetTurn() + " clicked on " + tileID);

    const player = getTurn();
    const check = checkWin(player, getIdArray(player), [tileID]);

    tile.className = setTileType(tile, player).replace(" enabled", "");
    tile.onclick = () => {};
    if (check != false){
        setTilesAsWon(player, check);
        gameOver();
    } else if (getElementArray("empty").length === 0) {
        gameOver();
    } else if (getOtherPlayer(player) === getAI()) {
        doAITurn(getTurn, getOtherPlayer(player));
    }
    //if AI is active, and the other player is AI
}

function doAITurn(getTurn, player, currentAIMode) {
    tileClicked(getTurn, getHardAITurn(player));
}

function getEasyAITurn() {
    const rand = Math.floor(Math.random() * 9) + 1;

    return document.getElementById(rand).className.includes("empty")
        ? rand
        : getEasyAITurn();
}

function getMedAITurn() {
    //try to Win
    const winningMove = findThirdTile(getIdArray(getAI()));
    if (winningMove != null) return winningMove;

    //try to not lose
    const blockingMove = findThirdTile(getIdArray(getOtherPlayer(getAI())));
    if (blockingMove != null) return blockingMove;

    //else random
    console.log("this turn is random");
    return getEasyAITurn();

    function findThirdTile(squareArr){
        if (squareArr.length < 2) return null;
        for (var i = 0; i < squareArr.length - 1; i++) {
            for (var j = i + 1; j < squareArr.length; j++) {
                const id = 15 - squareArr[i] - squareArr[j];
                if (id > 0 && id < 10 &&
                    document.getElementById(id).className.includes("empty")) {
                        return id;
                }
            }
        }
    }
}

function getHardAITurn(player) {
    // Skynet came online 2016/11/19 at 19:43:07
    if (document.getElementsByClassName("empty").length === 9) {
        // if every tile is empty, pick a random corner
        return pickRandomCorner();
    } else if (document.getElementsByClassName("empty").length === 8) {
        return document.getElementById(5).className.includes("empty")
            ? 5
            : pickRandomCorner();
    } else {
        const allMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const currentGameTree = getStateChildren(
            allMoves.filter(
                x => document.getElementById(x).className.includes("empty")
            ),
            getIdArray("x"),
            getIdArray("o"),
            0
        );
//TODO: refactor getStateChildren to return the key so it can be used here
        //console.log(currentGameTree);
        var finalTurn;
        var finalScore = true;
        for (var key in currentGameTree.children) {
            const possibleTurn = currentGameTree.children[key];
            if (finalScore === true ||
                (player === "x" && possibleTurn.score > finalScore) ||
                (player === "o" && possibleTurn.score < finalScore) ||
                (possibleTurn.score === finalScore &&
                    Math.floor(Math.random() * 2) === 1)) {
                    //console.log(possibleTurn + "'s score is " + possibleTurn.score + " and is less than " + finalScore)
                    finalTurn = key;
                    finalScore = possibleTurn.score;
            }
        }
        return document.getElementById(finalTurn);
    }

    function pickRandomCorner() {
        const cornerTiles = [2, 4, 6, 8];
        return cornerTiles[Math.floor(Math.random() * 4)];
    }
};

function getElementArray(className) {
    return  [].slice.call(document.getElementsByClassName(className));
}

function getIdArray(player) {
    return getElementArray(player).map((element) => {
        return element.id
    });
}

function checkWin(player, numbers, partial) {
    //  Goal: return array of winning tile values
    //  if there are no winning values, return false
    var sum;
    var winningTiles = [];

    partial = partial || [];

    sum = partial.reduce((a, b) => {
        return parseInt(a) + parseInt(b);
    }, 0);

    if (sum === 15 && partial.length === 3)
        return partial;

    if (sum >= 15 || partial.length > 2)
        return false;

    for (var i = 0; i < numbers.length; i++) {
        const n = numbers[i];
        const remaining = numbers.slice(i + 1);
        const check = checkWin(player, remaining, partial.concat([n]));
        if(check != false) {
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

function gameOver() {
    getElementArray("tile").forEach((tile) => {
        if (tile.id === "5") {
            tile.onclick = () => {setupGame();}

            tile.appendChild(document.createElement("DIV").appendChild(
                    document.createTextNode("NEW GAME")));

            if (!tile.className.includes("enabled"))
                tile.className += " enabled";

        } else {
            tile.onclick = () => {};
            tile.className = tile.className.replace(" enabled", "");
            if (!tile.className.includes("win"))
                tile.className += " disabled";
        }
    });
}

function setTilesAsWon(player, winningTiles) {
    console.log(player + " has won!");

    winningTiles.forEach((tile) => {
        document.getElementById(tile).className += " win";
    });
}

function setTileType(tile, newType) {
    return tile.className.replace(/x|o|new-game|empty/, newType);
}

function toggleSettingsMenu() {
    document.getElementById("settings").className =
        document.getElementById("settings").className === "hidden"
        ? "visible"
        : "hidden";
}

function getAI() {
    return getElementArray("selected")[0].id.substring(3)
}

function settingClicked(aiSetting) {
    getElementArray("menu-item").forEach((setting) =>
        setting.className = setting.className.replace(" selected", "")
    );
    document.getElementById("ai-" + aiSetting).className += " selected";
    console.log("AI is " + getAI());

    toggleSettingsMenu();
    setupGame();
}

//TODO: get rid of all this old code down here
//      this is only used for console debugging
function oldGetTurn() {
    console.log(getNumElements("x") + " x, " + getNumElements("o") + " o");
    return getNumElements("x") === getNumElements("o") ? "x" : "o";
}

function getNumElements(elementClass) {
    return document.getElementsByClassName(elementClass).length;
}
