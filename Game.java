import java.util.Scanner;
import java.util.ArrayList;

public class Game {
    private static Scanner scan = new Scanner(System.in);
    private static TTT game = new TTT();

    public static void main(String[] args) {
        boolean keepPlaying = true;
        while (keepPlaying) {
            playGame();
            System.out.println();
            System.out.println("Play again? (y/(Any key))");
            scan.nextLine();
            keepPlaying = scan.nextLine().trim().equals("y");
            if (keepPlaying) {
                game.newGame();
            }
        }
    }

    public static void playGame() {
        while (!game.hasPlayerWon()) {
            printBoard();
            boolean isTurnOver = false;

            while (!isTurnOver) {
                System.out.println(game.getPrompt());
                isTurnOver = game.tryMakePlay(getIntInput());
                if (!isTurnOver) {
                    System.out.println(game.getErrorPrompt());
                }
            }
            System.out.println();
        }
        printBoard();
        System.out.println();
        System.out.println(game.getWinner() + " has won!");
    }

    public static void printBoard() {
        System.out.println();
        ArrayList<String> print = game.getBoard();

        for (int i = 0; i < print.size(); i++) {
            System.out.println(print.get(i));
            if (i < print.size() - 1) {
                System.out.println("-----------");
            }
        }
        System.out.println();
    }

    public static int getIntInput() {
        int i = -1;
        while (!(i > 0 && i < 10)) {
            i = scan.nextInt();
            if (!(i > 0 && i < 10)) {
                System.out.println("Input out of bounds");
            }
        }
        return i;
    }
}
