import java.util.ArrayList;

public class Player {
    private ArrayList<Integer> spaces = new ArrayList<Integer>();
    private char c;
    private boolean win = false;

    public Player(char c) {
        this.c = c;
    }

    public char getChar() {
        return c;
    }

    public boolean contains(int i) {
        return spaces.contains(i);
    }

    public void play(int space) {
        spaces.add(space);
        win = hasWon();
    }

    public ArrayList getSpaces() {
        return spaces;
    }

    public boolean getHasWon() {
        return win;
    }

    public boolean hasWon() {
        if (spaces.size() < 3) {
            return false;
        }
        for (int i = 0; i < spaces.size() - 2; i++) {
            int x = spaces.get(i);
            for (int j = i + 1; j < spaces.size() - 1; j++) {
                int y = spaces.get(j);
                for (int k = j + 1; k < spaces.size(); k++) {
                    int z = spaces.get(k);
                    if ((x + y + z) == 15) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
