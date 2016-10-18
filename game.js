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

function setupGame() {
    var getTurn = setupTurn();

    [].forEach.call(document.getElementsByClassName("tile"), (value) => {
        value.onclick = () => {doPlayerTurn(value, getTurn)};

        value.className = "tile empty enabled";

        while(value.firstChild)
            value.removeChild(value.firstChild);
    });

    if (getAI() == "ai-x") doAITurn(getTurn);
}

function setupTurn() {
    var turns = true;

    return () => {
        return turns = !turns;
    }
}

function squareClicked(square, getTurn){
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
        checkWin(player,
            [].slice.call(toArray(document.getElementsByClassName(player))),
            15
        );
        return !checkGameOver();
    }
}

function doPlayerTurn(square, getTurn) {
    if (squareClicked(square, getTurn) && getAI() != "ai-off") {
        doAITurn(getTurn);
    }
}

function doAITurn(getTurn) {
    squareClicked(getMedAITurn(), getTurn);
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
    //try to Win
    var player = getAI() == "ai-x" ? "x" : "o";
    var play = 0;
    var squares = toArray(document.getElementsByClassName(player));
    squares.forEach((square) => {
        var squares2 = squares.slice(squares.indexOf(square) + 1, squares.length);
        //console.log(squares2);
        squares2.forEach((square2) => {
            var id = 15 - parseInt(square) - parseInt(square2);
            //console.log(id);
            if (id > 0 && id < 10 && document.getElementById(id).className.contains("empty")) {
                play = document.getElementById(id);
                console.log("IF I GO HERE I WIN " + id + " " + square);
                return;
            }
        })
    });
    if (play != 0) return play;

    //try to not lose
    player = getAI() == "ai-x" ? "o" : "x";
    squares = toArray(document.getElementsByClassName(player));
    squares.forEach((square) => {
        var squares2 = squares.slice(squares.indexOf(square) + 1, squares.length);
        squares2.forEach((square2) => {
            var id = 15 - parseInt(square) - parseInt(square2);
            console.log("id: " + id);
            console.log("1: " + square + "| 2: " + square2);
            if (id > 0 && id < 10 && document.getElementById(id).className.contains("empty")) {
                play = document.getElementById(id);
                console.log("IF I GO HERE I BLOCK " + id + " " + square);
                return;
            }
        })
    });
    if (play != 0) return play;
    //else random
    return getEasyAITurn();
}

function toArray(myCollection) {
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
        if (partial.length != 3) return;
        hasWon(player, partial);
    }

    if (s >= target) {
        return;  // if we reach the number why bother to continue
    }

    for (var i = 0; i < numbers.length; i++) {
        n = numbers[i];
        remaining = numbers.slice(i + 1);
        checkWin(player, remaining, target, partial.concat([n]));
    }
}

function checkGameOver() {
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
            if (tile.className.contains("enabled")) tile.className = tile.className.replace(" enabled", "");
            if (!tile.className.contains("win")) tile.className += " disabled";
        });

        setMiddle(document.getElementById("5"));

        function setMiddle(middle) {
            middle.onclick = () => {
                setupGame();
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

var getAI =
    () => {
        return "ai-off";
    };

function settingClicked(id) {
    getAI = () => {
        return id;
    };
    console.log(getAI());

    toggleSettings();
    setupGame();
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
