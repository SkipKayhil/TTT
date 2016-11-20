// TODO: Alright time for some thoughts:
// x. Clearly I should be using JSON for this
// x. Start with global variable that then gets passed around?
// 2a.  Call the minmax function when its the AI's turn
// 3. JSON should have these elements:
// 3a.  The move (tileID: #)
// 3b.  The depth (depth: #)
// 3c.  The score (score: #)
// 3d.  The children (children: {})
// 4. CheckWin should only check if new tile creates win.
// 5. Refactor variables so code is more readable
// 5a.  Make PlayerTurn/AITurn return values instead of DOM elements
// 6. make the tileIDs rotate so gameTree is only 4/9ths the size

// const defaultGameTree = () => {
//     // things to pass in:
//     // 1.   allMoves (available moves)
//     // 2.
//     const allMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//     var tree = {};
//     tree.children = {};
//     //for (var i = 1; i < 10; i++) {
//     allMoves.forEach(i => {
//         tree.children[i] = getStateChildren(allMoves.filter(x => x != i), [i], i)
//     });
//     return tree;
const defaultGameTree;
    function getStateChildren(tilesLeft, xTiles, oTiles, tileID) {
        var turn = {};
        turn.tileID = tileID;
        turn.score = true;

        const depth = xTiles.length + oTiles.length;
        const player = depth % 2 == 1 ? "x" : "o";
        turn.depth = depth;
        turn.player = player;
        const mod = player == "x" ? 1 : -1;

        //check for player win
        if (checkWin(player, player == "x" ? xTiles : oTiles) != false) {
            //console.log("win condition: " + xTiles)
            turn.score = (10 - depth) * mod;
        } else if (depth == 9) {
            // if the depth is 9 and not a win, then its a tie
            turn.score = 0;
        } else {
            turn.children = {};
            tilesLeft.forEach((tile) => {
                if (player == "x") {
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
                if (turn.score == true ||
                    (player == "x" && turn.children[tile].score < turn.score) ||
                    (player == "o" && turn.children[tile].score > turn.score)) {
                    turn.score = turn.children[tile].score;
                }
            });
        }
        return turn;
    }
// }

window.onload = () => {
    setupViewport();
    var setupGame = curryGameSetup(defaultGameTree);
    [].forEach.call(document.getElementsByClassName("menu-item"), (item) => {
        item.onclick = getSettingClicked(setupGame, item.id);
    });
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
    [].forEach.call(document.getElementsByClassName("button"), (button) => {
        button.style.margin = buttonMargin;
        button.style.padding = buttonPadding;
    });
    document.getElementById("footer").style.height = footHeight;
    document.getElementById("game").style.width = gameWidth;
    document.getElementById("game").style.height = gameHeight;
}

function curryGameSetup(defaultGameTree) {
    return function setup() {
        var getTurn = setupTurnBoolean();
        var squareClicked = currySquareClicked(getTurn, setup);
        setPlayerTurn = setupPlayerTurn(squareClicked);

        [].forEach.call(document.getElementsByClassName("tile"), (value) => {
            value.onclick = setPlayerTurn(defaultGameTree, value);

            value.className = "tile empty enabled";

            while(value.firstChild)
                value.removeChild(value.firstChild);
        });

        if (getAI() == "x") doAITurn(squareClicked);
    }
}

function setTileClick(gameTree) {
    [].forEach.call(document.getElementsByClassName("tile"), (value) => {
        if(!value.className.contains("empty"))
            value.onclick = setPlayerTurn(gameTree, value);
    });
}

function setupTurnBoolean() {
    var turns = true;

    return () => {
        return turns = !turns;
    }
}

function currySquareClicked(getTurn, doSetup) {
    return function(square){
        console.log(oldGetTurn() + " clicked on " + square.id);

        //TODO: basically here's the logic I want to implement:
        // 2.   make game playable with AI
        // 2a.      Add functionality to enable AI (X, O, OFF)
        // 2b.  Add functionality to set AI difficulty (Easy, Good, Hard
        // 2c.      Add easy AI mode
        // 2d.      Add good AI mode
        // 2f.  Add logical hard AI mode?
        // 3.   Add safari prefixes because apparently webkit has to be special
        // 3a.  Add mobile touch support

        const player = getTurn() ? "o" : "x";
        const check = checkWin(player,
            checkWin(player, getIdArray(player), [square.id]));

        square.className = setTileType(square, player).replace(" enabled", "");
        square.onclick = () => {};
        if (check != false){
            hasWon(player, check);
        }
        return !checkGameOver(doSetup);
    }
}

// function updateGameTree(gameTree, lastTurn) {
//     for (var i = 0; i < gameTree.getChildren().length; i++) {
//         if (gameTree.getChildren()[i].getID == lastTurn)
//             return gameTree.getChildren()[i];
//     }
// }

function setupPlayerTurn(squareClicked) {
    return function(gameTree, value) {
        return function() {
            if (squareClicked(value) && getAI() != "off") {
                doAITurn(squareClicked);
            }
        }
    }
}
var setPlayerTurn;

var doAITurn = function(squareClicked) {
    squareClicked(getHardAITurn());
}

function getEasyAITurn() {
    var rand = Math.floor(Math.random() * 9) + 1;
    if (document.getElementById(rand).className.contains("empty")) {
        return document.getElementById(rand);
    } else {
        return getEasyAITurn();
    }
}

function getMedAITurn() {
    var play = null;

    //try to Win
    play = findThirdTile(getIdArray(getAI()));
    if (play != null) return play;

    //try to not lose
    play = findThirdTile(getIdArray(getNotAI()));
    if (play != null) return play;

    //else random
    return getEasyAITurn();

    function findThirdTile(squareArr){
        if (squareArr.length < 2) return null;
        for (var i = 0; i < squareArr.length - 1; i++) {
            for (var j = i + 1; j < squareArr.length; j++) {
                var id = 15 - squareArr[i] - squareArr[j];
                if (id > 0 && id < 10
                    && document.getElementById(id).className.contains("empty"))
                {
                        return document.getElementById(id);
                }
            }
        }
    }
}

function getHardAITurn() {
    // Skynet came online 2016/11/19 at 19:43:07
    if (document.getElementsByClassName("empty").length == 9) {
        // if every tile is empty, pick a random corner
        const cornerTiles = [2, 4, 6, 8];
        const rand = Math.floor(Math.random() * 4);
        return document.getElementById(cornerTiles[rand]);
    } else {
        const allMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // const emptyTiles = allMoves.filter(
        //     x => document.getElementById(x).className.contains("empty")
        // );
        // const usedTiles = allMoves.filter(
        //     x => emptyTiles.indexOf(x) == -1
        // );
        const currentGameTree = getStateChildren(
            allMoves.filter(
                x => document.getElementById(x).className.contains("empty")
            ),
            getIdArray("x"),
            getIdArray("o"),
            0
        );
        //console.log(currentGameTree);
        var finalTurn;
        var finalScore = true;
        for (var key in currentGameTree.children) {
            const possibleTurn = currentGameTree.children[key];
            if (finalScore == true ||
                (getAI() == "x" && possibleTurn.score > finalScore) ||
                (getAI() == "o" && possibleTurn.score < finalScore)) {
                    //console.log(possibleTurn + "'s score is " + possibleTurn.score + " and is less than " + finalScore)
                    finalTurn = key;
                    finalScore = possibleTurn.score;
            }
        }
        return document.getElementById(finalTurn);
    }
};

function getIdArray(player) {
    var a = [];
    [].forEach.call(document.getElementsByClassName(player), (value) => {
        a.push(parseInt(value.id));
    });
    return a;
}

function checkWin(player, numbers, partial) {
    var s, n, remaining;

    partial = partial || [];

    s = partial.reduce((a, b) => {
        return parseInt(a) + parseInt(b);
    }, 0);

    if (s === 15) {
        return partial.length == 3 ? partial : false;
    }

    if (s >= 15) {
        //return;  // if we reach the number why bother to continue
        return false;
    }

    for (var i = 0; i < numbers.length; i++) {
        n = numbers[i];
        remaining = numbers.slice(i + 1);
        var check = checkWin(player, remaining, partial.concat([n]));
        if(check != false)
            return check;
    }
    return false;
}

function checkGameOver(doSetup) {
    var isWin = false;
    var noEmpty = true;

    [].forEach.call(document.getElementsByClassName("tile"), (tile) => {
        if (tile.className.contains("win")) {
            isWin = true;
        }
        if (tile.className.contains("empty")) {
            noEmpty = false;
        }
    });

    if ((isWin || noEmpty) && !document.getElementById("5").firstChild) {
        gameOver();
        return true;
    } else return false;

    function gameOver() {
        [].forEach.call(document.getElementsByClassName("tile"), (tile) => {
            tile.onclick = () => {};
            if (tile.className.contains("enabled"))
                tile.className = tile.className.replace(" enabled", "");
            if (!tile.className.contains("win"))
                tile.className += " disabled";
        });

        setMiddle(document.getElementById("5"));

        function setMiddle(middle) {
            middle.onclick = () => {
                doSetup();
            }

            var p = document.createElement("DIV");
            p.appendChild(document.createTextNode("NEW GAME"));
            middle.appendChild(p);

            middle.className = middle.className.replace(" disabled", "");
            middle.className += " enabled";
        }
    }
}

function hasWon(player, partial) {
    console.log(player + " has won!");

    partial.forEach((value) => {
        document.getElementById(value).className += " win";
    });

    //TODO figure out a better way to implement double wins
    //
    // if (player == "x" && partial.indexOf(5) != -1) {
    //     if (partial.indexOf(2) != -1 && partial.indexOf(8) != -1) {
    //         document.getElementById(6).className += " win";
    //         document.getElementById(4).className += " win";
    //     } else if (partial.indexOf(7) != -1 && partial.indexOf(3) != -1) {
    //         document.getElementById(1).className += " win";
    //         document.getElementById(9).className += " win";
    //     }
    // }
}

function setTileType(tile, newType) {
    if (tile.className.contains("x"))
        return tile.className.replace("x", newType);
    else if (tile.className.contains("o"))
        return tile.className.replace("o", newType);
    else if (tile.className.contains("new-game"))
        return tile.className.replace("new-game", newType);
    else if (tile.className.contains("empty"))
        return tile.className.replace("empty", newType);
    else
        return tile.className;
}

function toggleSettings() {
    if (document.getElementById("settings").className == "hidden") {
        document.getElementById("settings").className = "visible";
    } else {
        document.getElementById("settings").className = "hidden";
    }
}

var getAI = () => {
    return "off";
};

function getNotAI() {
    return getAI() == "x" ? "o" : "x";
}

function getSettingClicked(doSetup, id) {
    return () => {
        getAI = () => {
            return id.substring(3, id.length);
        };
        console.log("AI is " + getAI());

        toggleSettings();
        doSetup();
    }
}

//TODO: get rid of all this old code down here
//      this is only used for console debugging
function oldGetTurn() {
    console.log(getNumElements("x") + " x, " + getNumElements("o") + " o");
    return getNumElements("x") == getNumElements("o") ? "x" : "o";
}

function getNumElements(elementClass) {
    return document.getElementsByClassName(elementClass).length;
}
