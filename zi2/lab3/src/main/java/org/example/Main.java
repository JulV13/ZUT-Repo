package org.example;
import java.sql.*;
import java.sql.DriverManager;
import java.util.Random;
public class Main {
    static void main() {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mariadb://","", "");
            System.out.println("Polaczono!");

            Statement st = conn.createStatement();
            st.execute("CREATE TABLE IF NOT EXISTS lab3 (id integer PRIMARY KEY AUTO_INCREMENT, liczba int, napis text)");
            st.executeUpdate("DELETE FROM lab3");
            st.executeUpdate("INSERT INTO lab3 (liczba, napis) VALUES (1, 'pierwszy')");
            st.executeUpdate("INSERT INTO lab3 (liczba, napis) VALUES (2, 'drugi')");
            st.executeUpdate("INSERT INTO lab3 (liczba, napis) VALUES (3, 'trzeci')");
            ResultSet rs = st.executeQuery("SELECT * FROM lab3");
            while (rs.next()) {
                System.out.println(rs.getInt("id") + " " + rs.getString("liczba") + " " + rs.getString("napis"));
            }

            String[] arr = {"jeden","dwa","trzy","cztery","piec","szesc","siedem","osiem","dziewiec","dziesiec"};
            PreparedStatement ps =  conn.prepareStatement("INSERT INTO lab3 (liczba, napis) VALUES (?, ?)");
            Random rand = new Random();
            for (String napis : arr) {
                int randNumber = rand.nextInt(50);
                ps.setInt(1, randNumber);
                ps.setString(2, napis);
                ps.executeUpdate();
            }
            ps.close();
            conn.close();

        } catch (SQLException e) {
            System.out.println("Blad polaczenia: " + e.getMessage());
        }
    }
}
