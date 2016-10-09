window.onload = () => {
    [].forEach.call(document.getElementsByClassName("tile"), (value) => {
        value.onclick = () => {squareClicked(value)};
        value.className += " empty";
    });
}

function squareClicked(square){
    console.log(oldGetTurn() + " clicked on " + square.id);

    //basically here's the logic I want to implement:
    // 1. make game playable with two people
    // 1b. make game RE-playable
    // 2. make game playable with AI

    if (square.className.includes("empty")) {
        //how do I refernce a value I want passed as an argument in an arrow function
        //there's definitely some way to not declare this variable right?
        //can I make an anonymous function here or do I have to define t externally?
        var player = getTurn() ? "o" : "x";
        square.className = square.className.replace("empty", player);
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
        console.log(player + " has won!")
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

var getTurn = (() => {
    var turns = true;

    return () => {
        return turns = !turns;
    }
})();

function oldGetTurn() {
    console.log(getNumElements("x") + " x, " + getNumElements("o") + " o");
    return getNumElements("x") == getNumElements("o") ? "x" : "o";
}

function getNumElements(elementClass) {
    return document.getElementsByClassName(elementClass).length;
}
