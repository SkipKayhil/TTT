window.onload = () => {
    setupViewport();
    var doSetup = setupGame(setupGameTree());
    [].forEach.call(document.getElementsByClassName("menu-item"), (item) => {
        item.onclick = getSettingClicked(doSetup, item.id);
    });
    doSetup();
}

window.onresize = (event) => {
    setupViewport();
}

function setupViewport() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    var navHeight, gameWidth, gameHeight, footHeight, buttonMargin, buttonPadding;

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

var setupGame = function(gameTree) {
    return function setup() {
        var getTurn = setupTurn();
        var squareClicked = setupSquareClick(getTurn, setup);
        setPlayerTurn = setupPlayerTurn(squareClicked);

        [].forEach.call(document.getElementsByClassName("tile"), (value) => {
            value.onclick = setPlayerTurn(gameTree, value);

            value.className = "tile empty enabled";

            while(value.firstChild)
                value.removeChild(value.firstChild);
        });

        if (getAI() == "x") doAITurn(squareClicked, gameTree);
    }
}

function setTileClick(gameTree) {
    [].forEach.call(document.getElementsByClassName("tile"), (value) => {
        if(!value.className.contains("empty"))
            value.onclick = setPlayerTurn(gameTree)(value);
    });
}

function setupTurn() {
    var turns = true;

    return () => {
        return turns = !turns;
    }
}

function setupSquareClick(getTurn, doSetup) {
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

        if (square.className.includes("empty")) {
            return doTurn(getTurn() ? "o" : "x");
        }

        function doTurn(player) {
            square.className = setTileType(square, player).replace(" enabled", "");
            getWinningTiles(player,
                checkWin(player, toIdArray(document.getElementsByClassName(player))));
            return !checkGameOver(doSetup);
        }

        function getWinningTiles(player, check) {
            if (check != false){
                hasWon(player, check);
            }
        }
    }
}

function updateGameTree(gameTree, lastTurn) {
    for (var i = 0; i < gameTree.getChildren().length; i++) {
        if (gameTree.getChildren()[i].getID == lastTurn)
            return gameTree.getChildren()[i];
    }
}

var setupPlayerTurn = function(squareClicked) {
    return function(gameTree, value) {
        return function() {
            if (squareClicked(value) && getAI() != "off") {
                doAITurn(squareClicked, updateGameTree(value.id));
            }
        }
    }
}
var setPlayerTurn;

var doAITurn = function(squareClicked, gameTree) {
    squareClicked(getHardAITurn(gameTree));
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
    play = findThirdTile(toIdArray(document.getElementsByClassName(getAI())));
    if (play != null) {
        //console.log(play.id + " to win");
        return play;
    }

    //try to not lose
    play = findThirdTile(toIdArray(document.getElementsByClassName(getNotAI())));
    if (play != null) {
        //console.log(play.id + " to block");
        return play;
    }

    //else random
    return getEasyAITurn();

    function findThirdTile(squareArr){
        if (squareArr.length < 2) return null;
        for (var i = 0; i < squareArr.length - 1; i++) {
            for (var j = i + 1; j < squareArr.length; j++) {
                var id = 15 - squareArr[i] - squareArr[j];
                if (id > 0 && id < 10
                    && document.getElementById(id).className.contains("empty")) {
                        //console.log("I should go here: " + id);
                        return document.getElementById(id);
                }
            }
        }
    }
}

function getHardAITurn(gameTree) {
    var bestTurn = 2;
    var newGameTree;
    for (var i = 0; i < gameTree.getChildren().length; i++) {
        console.log(gameTree.getChildren());
        if (gameTree.getChildren()[i].getSum() > bestTurn) {
            bestTurn = i;
            newGameTree = gameTree.getChildren()[i];
        }
    }

    //end of turn
    doAITurn = function(squareClicked) {
        squareClicked(getHardAITurn(newGameTree));
    }

    setTileClick(updateGameTree(gameTree, bestTurn));

    return document.getElementById(bestTurn);
};

function toIdArray(myCollection) {
    var a = [];
    [].forEach.call(myCollection, (value) => {
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

function setupGameTree() {
    var children = [];
    console.log("setting up game tree");
    for (var i = 1; i < 10; i++) {
        var remaining = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        console.log(remaining.splice(remaining.indexOf(i), 1));
        //console.log(remaining);
        var child = createNode(i, true, 0, [], [], remaining.splice(remaining.indexOf(i), 1));
        children.push(child);
    }

    return {
        getChildren: function() {
            return children;
        }
    }
}

function createNode(id, player, parent, myOldMoves, theirMoves, remainingMoves) {
    //console.log("creating node for " + id + " "  + parents)
    var myMoves = myOldMoves.concat(parent); //array of id?
    var sum = 0;
    var children = []; //array of nodes
    remainingMoves.splice(remainingMoves.indexOf(id), 1);

    // var myMoves = []
    // var theirMoves = [];
    //         [].forEach.call(parentList, (element) => {
    //     if (element.getPlayer == player) {
    //         myMoves.push(element);
    //     } else {
    //         theirMoves.push(element);
    //     }
    // });

    if(checkWin(player ? "x" : "o", myMoves.concat(id)) != false) {
        sum = player ? 1 : -1;
    } else if (myMoves.length + theirMoves.length == 8) {
        sum = 0;
    } else {
        for (var i = 0; i < remainingMoves.length; i++) {
            var child = createNode(remainingMoves[i], !player, id, theirMoves, myMoves, remainingMoves);
            children.push(child);
            sum += child.getSum();
        }
    }
    return {
        getPlayer: function() {
            return player;
        },
        getID: function() {
            return id;
        },
        getSum: function() {
            return sum;
        },
        getChildren: function() {
            return children;
        }
    }
};

//TODO: get rid of all this old code down here
//      this is only used for console debugging
function oldGetTurn() {
    console.log(getNumElements("x") + " x, " + getNumElements("o") + " o");
    return getNumElements("x") == getNumElements("o") ? "x" : "o";
}

function getNumElements(elementClass) {
    return document.getElementsByClassName(elementClass).length;
}
