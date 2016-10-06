import java.util.Scanner;
import java.util.ArrayList;

public class Driver {
    private static Scanner scan = new Scanner(System.in);

    public static void main(String[] args) {
        boolean keepPlaying = true;
        while(keepPlaying) {
            playGame();
            System.out.println();
            System.out.println("Play again? (y/(Any key))");
            scan.nextLine();
            keepPlaying = scan.nextLine().trim().equals("y");
        }
    }

    public static void playGame() {
        TTT game = new TTT();

        while (!game.hasPlayerWon()) {
            printBoard(game.getBoard());
            boolean isTurnOver = false;
            while (!isTurnOver) {
                System.out.println(game.getPrompt());
                isTurnOver = game.tryMakePlay(scan.nextInt());
                if (!isTurnOver) System.out.println(game.getErrorPrompt());
            }
            System.out.println();
        }
        printBoard(game.getBoard());
        System.out.println();
        System.out.println(game.getWinner() + " has won!");
    }

    public static void printBoard(ArrayList<String> print) {
        System.out.println();
        for (int i = 0; i < print.size(); i++) {
            System.out.println(print.get(i));
            if (i < print.size() - 1) {
                System.out.println("-----------");
            }
        }
        System.out.println();
    }
}
