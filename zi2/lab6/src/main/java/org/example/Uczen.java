package org.example;
import jakarta.persistence.*;

@Entity
public class Uczen {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String imie;
    private String nazwisko;
    private Integer wiek;

    @ManyToOne
    @JoinColumn(name = "klasa_id")
    private Klasa klasa;

    public Long getId() { return id;}
    public void setId(Long id) { this.id = id; }

    public String getImie() { return imie; }
    public void setImie(String imie) { this.imie = imie; }

    public String getNazwisko() { return nazwisko; }
    public void setNazwisko(String nazwisko) { this.nazwisko = nazwisko; }

    public Integer getWiek() { return wiek; }
    public void setWiek(int wiek) { this.wiek = wiek; }

    public Klasa getKlasa() { return klasa; }
    public void setKlasa(Klasa klasa) { this.klasa = klasa; }
}
