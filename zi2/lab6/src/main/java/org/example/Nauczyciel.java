package org.example;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Nauczyciel {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String imie;
    private String nazwisko;
    private Integer wiek;

    @OneToMany(mappedBy = "nauczyciel")
    private List<Przedmiot> przedmioty = new ArrayList<>();

    @OneToOne(mappedBy = "wychowawca")
    private Klasa wychowawcaKlasy;

    public Long getId() { return id;}
    public void setId(Long id) { this.id = id; }

    public String getImie() { return imie; }
    public void setImie(String imie) { this.imie = imie; }

    public String getNazwisko() { return nazwisko; }
    public void setNazwisko(String nazwisko) { this.nazwisko = nazwisko; }

    public Integer getWiek() { return wiek; }
    public void setWiek(int wiek) { this.wiek = wiek; }
}
