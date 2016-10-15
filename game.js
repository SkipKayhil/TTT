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
    var navHeight;
    var gameWidth;

    if (width > height) {       //landscape
        var min = height;
        if (width < 960) {          //phone
            navHeight = 48;
        } else {                    //tablet
            navHeight = 64;
        }
    } else {                    //portrait
        var min = width;
        if (width < 600) {          //phone
            navHeight = 56;
        } else {                    //tablet
            navHeight = 64;
        }
    }

    gameWidth = min - navHeight;

    document.getElementById("navbar").style.height = navHeight + "px";
    document.getElementById("game").style.width = gameWidth + "px";
    console.log(document.getElementById("game").clientHeight);
    //
    // [].forEach.call(document.getElementsByClassName("tile"), (tile) => {
    //     var temp = (29 / 33 * (gameWidth) / 3);
    //     console.log(temp);
    //     tile.style.height =  temp + "px";
    //     tile.style.width = tile.style.height;
    //     tile.style.margin = (4 / 33 * gameWidth / 3 / 2) + "px";
    // });
}

function setupGame() {
    var getTurn = setupTurn();

    [].forEach.call(document.getElementsByClassName("tile"), (value) => {
        value.onclick = () => {squareClicked(value, getTurn)};

        value.className = "tile empty enabled";

        while(value.firstChild)
            value.removeChild(value.firstChild);
    });
}

function setupTurn() {
    var turns = true;

    return () => {
        return turns = !turns;
    }
}

function squareClicked(square, getTurn){
    console.log(oldGetTurn() + " clicked on " + square.id);

    //basically here's the logic I want to implement:
    // 1    stalemate detection
    // 1b.  Win/Loss notification
    // 2.   make game playable with AI
    // 2a.  Add functionality to enable AI (X, O, OFF)
    // 2b.  Add functionality to set AI difficulty (Easy, Good, Hard
    // 2c.  Add easy AI mode
    // 2d.  Add good AI mode
    // 2e.  Add hardcoded hard AI mode

    if (square.className.includes("empty")) {
        doTurn(getTurn() ? "o" : "x");
    }

    function doTurn(player) {
        square.className = setTileType(square, player).replace(" enabled", "");
        checkWin(player,
            [].slice.call(toArray(document.getElementsByClassName(player))),
            15
        );
        if (isGameOver()) {
            gameOver();
        }

        function isGameOver() {
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

            return isWin || noEmpty;
        }
    }
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

//TODO: get rid of all this old code down here
//      this is only used for console debugging
function oldGetTurn() {
    console.log(getNumElements("x") + " x, " + getNumElements("o") + " o");
    return getNumElements("x") == getNumElements("o") ? "x" : "o";
}

function getNumElements(elementClass) {
    return document.getElementsByClassName(elementClass).length;
}
