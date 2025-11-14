package org.example;
import jakarta.persistence.*;

@Entity
public class Przedmiot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nazwa;

    @ManyToOne
    @JoinColumn(name = "klasa_id")
    private Klasa klasa;

    @ManyToOne
    @JoinColumn(name = "nauczyciel_id")
    private Nauczyciel nauczyciel;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNazwa() { return nazwa; }
    public void setNazwa(String nazwa) { this.nazwa = nazwa; }

    public Klasa getKlasa() { return klasa; }
    public void setKlasa(Klasa klasa) { this.klasa = klasa; }

    public Nauczyciel getNauczyciel() { return nauczyciel; }
    public void setNauczyciel(Nauczyciel nauczyciel) { this.nauczyciel = nauczyciel; }
}
