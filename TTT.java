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
    private static final HashMap<Integer, Integer> ID_MAP;
    static {
        ID_MAP = new HashMap<Integer, Integer>();
        ID_MAP.put(2, 00);
        ID_MAP.put(7, 01);
        ID_MAP.put(6, 02);
        ID_MAP.put(9, 10);
        ID_MAP.put(5, 11);
        ID_MAP.put(1, 12);
        ID_MAP.put(4, 20);
        ID_MAP.put(3, 21);
        ID_MAP.put(8, 22);
    }

    public TTT() {
        newGame();
    }

    public void newGame() {
        x = new Player('X');
        o = new Player('O');
        board = new String[][] {
            {"2", "7", "6"},
            {"9", "5", "1"},
            {"4", "3", "8"}};
        turn = true;
    }
    public boolean tryMakePlay(int space) {
        if (!x.contains(space) && !o.contains(space)) {
            getTurn().play(space);
            int row = ID_MAP.get(space) / 10;
            int col = ID_MAP.get(space) % 10;
            board[row][col] = String.valueOf(getTurn().getChar());
            turn = !turn;
            return true;
        } else {
            return false;
        }
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
        for (String[] boardRow: board) {
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
