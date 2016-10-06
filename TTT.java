import java.util.HashMap;
import java.util.ArrayList;

public class TTT {
    // 2 7 6
    // 9 5 1
    // 4 3 8

    private Player x;
    private Player o;
    private boolean turn;
    private String[][] board;
    private String winner;
    private static final HashMap<Integer, Integer> map;
    static {
        map = new HashMap<Integer, Integer>();
        map.put(2, 00);
        map.put(7, 01);
        map.put(6, 02);
        map.put(9, 10);
        map.put(5, 11);
        map.put(1, 12);
        map.put(4, 20);
        map.put(3, 21);
        map.put(8, 22);
    }

    public TTT() {
        newGame();
    }

    public void newGame() {
        x = new Player('X');
        o = new Player('O');
        board = new String[][]{{"2", "7", "6"},{"9", "5", "1"}, {"4", "3", "8"}};
        turn = true;
    }
    public boolean tryMakePlay(int space) {
        if (!x.contains(space) && !o.contains(space)) {
            getTurn().play(space);
            int row = map.get(space) / 10;
            int col = map.get(space) % 10;
            board[row][col] = String.valueOf(getTurn().getChar());
            turn = !turn;
            return true;
        } else return false;
    }

    private Player getTurn() {
        return turn ? x : o;
    }

    public String getWinner() {
        return winner;
    }

    public boolean hasPlayerWon() {
        winner = x.getHasWon() ? "X" : "O";
        return (x.getHasWon() || o.getHasWon());
    }

    public String getPrompt() {
        return "Input the number of an available square";
    }

    public String getErrorPrompt() {
        return "That square is taken!";
    }

    public ArrayList<String> getBoard() {
        ArrayList<String> toReturn = new ArrayList<String>();
        for(String[] boardRow: board){
            String printRow = " ";
            for (String s: boardRow) {
                if (s != null) {
                    printRow += s;
                } else {
                    printRow += " ";
                }
                printRow += " | ";
            }
            toReturn.add(printRow.substring(0, printRow.length() - 3));
        }
        return toReturn;
    }
}
