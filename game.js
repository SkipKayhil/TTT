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

        [].forEach.call(document.getElementsByClassName("tile"), (value) => {
            value.onclick = () => {
                if (squareClicked(value) && getAI() != "off") {
                    doAITurn(squareClicked);
                }
            };

            value.className = "tile empty enabled";

            while(value.firstChild)
                value.removeChild(value.firstChild);
        });

        if (getAI() == "x") doAITurn(squareClicked);
    }
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
        // 1b.      Win/Loss notification - what did I mean by this? the colors?
        // 2.   make game playable with AI
        // 2a.      Add functionality to enable AI (X, O, OFF)
        // 2b.  Add functionality to set AI difficulty (Easy, Good, Hard
        // 2c.      Add easy AI mode
        // 2d.  Add good AI mode
        // 2e.  Add hardcoded hard AI mode
        // 2f.  Add logical hard AI mode?
        // 3.   Add safari prefixes because apparently webkit has to be special

        if (square.className.includes("empty")) {
            return doTurn(getTurn() ? "o" : "x");
        }

        function doTurn(player) {
            square.className = setTileType(square, player).replace(" enabled", "");
            if (checkWin(player, toIdArray(document.getElementsByClassName(player)), 15))
                hasWon();
            return !checkGameOver(doSetup);
        }
    }
}

var doAITurn = function(squareClicked) {
    squareClicked(getMedAITurn());
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
    //end of turn
    doAITurn = function(squareClicked) {
        squareClicked(getHardAITurn(gameTree));
    }
};

function toIdArray(myCollection) {
    var a = [];
    [].forEach.call(myCollection, (value) => {
        a.push(parseInt(value.id));
    });
    return a;
}

function checkWin(player, numbers, target, partial) {
    var s, n, remaining;

    partial = partial || [];

    s = partial.reduce((a, b) => {
        return parseInt(a) + parseInt(b);
    }, 0);

    if (s === target) {
        if (partial.length != 3) return false;
        hasWon(player, partial);
    }

    if (s >= target) {
        //return;  // if we reach the number why bother to continue
        return false;
    }

    for (var i = 0; i < numbers.length; i++) {
        n = numbers[i];
        remaining = numbers.slice(i + 1);
        if(checkWin(player, remaining, target, partial.concat([n]))) return true;
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
    var nodes;

    // var createNode = ((parent, parents) => {
    //     var parentList = parents.push(parent);
    //     var flag = false;
    //     var myMoves;
    //     [].forEach.call(parentList.map((element) => {
    //         if (flag) {
    //             myMoves.push(element);
    //         }
    //         flag = !flag;
    //     });
    //
    // })();


    return () => {

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
