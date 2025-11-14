package org.example;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Klasa {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String nazwa;
    private int poziom;

    @OneToOne
    @JoinColumn(name = "nauczyciel_id") // wychowawca
    private Nauczyciel wychowawca;
    @OneToMany(mappedBy = "klasa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Uczen> uczniowie = new ArrayList<>();
    @OneToMany(mappedBy = "klasa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Przedmiot> przedmioty = new ArrayList<>();

    public Long getId() { return id;}
    public void setId(Long id) { this.id = id; }
    public String getNazwa() { return nazwa; }
    public void setNazwa(String nazwa) { this.nazwa = nazwa; }
    public int getPoziom() { return poziom; }
    public void setPoziom(int poziom) { this.poziom = poziom; }
    public Nauczyciel getWychowawca() { return wychowawca; }
    public void setWychowawca(Nauczyciel wychowawca) { this.wychowawca = wychowawca; }
    public List<Uczen> getUczniowie() { return uczniowie; }
    public List<Przedmiot> getPrzedmioty() { return przedmioty; }
}
