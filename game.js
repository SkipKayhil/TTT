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
        square.className.replace("empty", getTurn() % 2 == 0 ? "o" : "x");
        //checkWin();
    }
}

var getTurn = (() => {
    var turns = 0;

    return () => {
        return ++turns;
    }
})();

function oldGetTurn() {
    console.log(getNumElements("x") + " x, " + getNumElements("o") + " o");
    return getNumElements("x") == getNumElements("o") ? "x" : "o";
}

function getNumElements(elementClass) {
    return document.getElementsByClassName(elementClass).length;
}
