window.onload = setup();

function setup() {
    var getTurn = setupTurn();

    setLight();

    [].forEach.call(document.getElementsByClassName("tile"), (value) => {
        value.onclick = () => {squareClicked(value, getTurn)};

        value.className = setTileType(value, "empty");

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

function setLight() {
    [].forEach.call(document.getElementsByTagName("*"), (element) => {
        if (element.className.contains("light") || element.className.contains("dark"))
            element.className = element.className.replace("dark", "light");
        else {
            element.className += " light";
        }
    });
}

function squareClicked(square, getTurn){
    console.log(oldGetTurn() + " clicked on " + square.id);

    //basically here's the logic I want to implement:
    // 1c. make the game beautiful
    // 2. make game playable with AI

    if (square.className.includes("empty")) {
        //how do I refernce a value I want passed as an argument in an arrow function
        //there's definitely some way to not declare this variable right?
        //can I make an anonymous function here or do I have to define t externally?
        doTurn(getTurn() ? "o" : "x");
    }

    function doTurn(player) {
        square.className = setTileType(square, player);
        checkWin(player,
            [].slice.call(toArray(document.getElementsByClassName(player))),
            15
        );
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

function hasWon(player, partial) {
    console.log(player + " has won!");

    [].forEach.call(document.getElementsByClassName("tile"), (tile) => {
        tile.onclick = () => {};
    });

    partial.forEach((value) => {
        document.getElementById(value).className += " win";
    });

    setMiddle(document.getElementById("5"));

    function setMiddle(middle) {
        middle.onclick = () => {
            setup();
        }

        var p = document.createElement("DIV");
        p.appendChild(document.createTextNode("NEW GAME"));
        console.log(p);
        middle.appendChild(p);

        middle.className = setTileType(middle, "new-game");
    }
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
