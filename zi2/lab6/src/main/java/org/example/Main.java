package org.example;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.transaction.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Main {

    @Transactional
    public static void noweDane(EntityManager em) {

        Nauczyciel n1 = new Nauczyciel();
        n1.setImie("Maciej");
        n1.setNazwisko("Polak");
        n1.setWiek(50);

        Nauczyciel n2 = new Nauczyciel();
        n2.setImie("Martyna");
        n2.setNazwisko("Kolej");
        n2.setWiek(35);

        Nauczyciel n3 = new Nauczyciel();
        n3.setImie("Waldemar");
        n3.setNazwisko("Dykta");
        n3.setWiek(59);

        em.persist(n1);
        em.persist(n2);
        em.persist(n3);

        Klasa k1 = new Klasa();
        k1.setNazwa("1C");
        k1.setPoziom(1);
        k1.setWychowawca(n1);

        Klasa k2 = new Klasa();
        k2.setNazwa("3D");
        k2.setPoziom(3);
        k2.setWychowawca(n2);

        // uczniowie klasa 1C
        Uczen u1 = new Uczen();
        u1.setImie("Piotrek");
        u1.setNazwisko("Damer");
        u1.setWiek(7);
        u1.setKlasa(k1);
        k1.getUczniowie().add(u1);

        Uczen u2 = new Uczen();
        u2.setImie("Malwina");
        u2.setNazwisko("Foler");
        u2.setWiek(7);
        u2.setKlasa(k1);
        k1.getUczniowie().add(u2);

        Uczen u3 = new Uczen();
        u3.setImie("Kamil");
        u3.setNazwisko("Piotrowski");
        u3.setWiek(7);
        u3.setKlasa(k1);
        k1.getUczniowie().add(u3);

        Uczen u4 = new Uczen();
        u4.setImie("Damian");
        u4.setNazwisko("Czajka");
        u4.setWiek(7);
        u4.setKlasa(k1);
        k1.getUczniowie().add(u4);


        // uczniowie klasa 3D
        Uczen u5 = new Uczen();
        u5.setImie("Maciej");
        u5.setNazwisko("Bak");
        u5.setWiek(9);
        u5.setKlasa(k2);
        k2.getUczniowie().add(u5);

        Uczen u6 = new Uczen();
        u6.setImie("Cyryl");
        u6.setNazwisko("Noc");
        u6.setWiek(9);
        u6.setKlasa(k2);
        k2.getUczniowie().add(u6);

        Uczen u7 = new Uczen();
        u7.setImie("Aleksandra");
        u7.setNazwisko("Lampart");
        u7.setWiek(9);
        u7.setKlasa(k2);
        k2.getUczniowie().add(u7);

        Uczen u8 = new Uczen();
        u8.setImie("Paulina");
        u8.setNazwisko("Cyrkiel");
        u8.setWiek(9);
        u8.setKlasa(k2);
        k2.getUczniowie().add(u8);

        // przedmioty klasy 1A
        Przedmiot p1 = new Przedmiot();
        p1.setNazwa("Matematyka");
        p1.setKlasa(k1);
        p1.setNauczyciel(n3);

        Przedmiot p2 = new Przedmiot();
        p2.setNazwa("Polski");
        p2.setKlasa(k1);
        p2.setNauczyciel(n1);

        Przedmiot p3 = new Przedmiot();
        p3.setNazwa("Historia");
        p3.setKlasa(k1);
        p3.setNauczyciel(n2);

        k1.getPrzedmioty().addAll(List.of(p1, p2, p3));

        // przedmioty klasy 3D
        Przedmiot p4 = new Przedmiot();
        p4.setNazwa("Plastyka");
        p4.setKlasa(k2);
        p4.setNauczyciel(n3);

        Przedmiot p5 = new Przedmiot();
        p5.setNazwa("Angielski");
        p5.setKlasa(k2);
        p5.setNauczyciel(n2);

        Przedmiot p6 = new Przedmiot();
        p6.setNazwa("Chemia");
        p6.setKlasa(k2);
        p6.setNauczyciel(n1);

        k2.getPrzedmioty().addAll(List.of(p4, p5, p6));

        em.persist(k1);
        em.persist(k2);

    }

    public static void pokazPrzedmiotyUcznia(Long uczenId, EntityManager em) {
        Uczen u = em.find(Uczen.class, uczenId);

        System.out.println("Uczen: " + u.getImie() + " " + u.getNazwisko());
        System.out.println("\nPrzedmioty:");

        for (Przedmiot p : u.getKlasa().getPrzedmioty()) {
            System.out.println(p.getNazwa() + " -> nauczyciel: " + p.getNauczyciel().getImie() + " " + p.getNauczyciel().getNazwisko());
        }
    }

    public static void pokazUczniowNauczyciela(Long nauczycielId, EntityManager em) {

        Nauczyciel nauczyciel = em.find(Nauczyciel.class, nauczycielId);

        System.out.println("Nauczyciel: " + nauczyciel.getImie() + " " + nauczyciel.getNazwisko());
        System.out.println("\nUczniowie z klas, w ktorych ten nauczyciel naucza:");

        List<Przedmiot> przedmioty = em.createQuery(
                        "SELECT p FROM Przedmiot p WHERE p.nauczyciel.id = :id", Przedmiot.class)
                .setParameter("id", nauczycielId)
                .getResultList();

        Set<Uczen> uczniowie = new HashSet<>();

        for (Przedmiot p : przedmioty) {
            Klasa klasa = p.getKlasa();
            if (klasa != null) {
                uczniowie.addAll(klasa.getUczniowie());
            }
        }

        for (Uczen u : uczniowie) {
            System.out.println(u.getImie() + " " + u.getNazwisko() + " -> klasa: " + u.getKlasa().getNazwa());
        }
    }

    public static void main(String[] args) {

        EntityManagerFactory emf = Persistence.createEntityManagerFactory("xd");
        EntityManager em = emf.createEntityManager();

        em.getTransaction().begin();
        noweDane(em);
        em.getTransaction().commit();

        System.out.println("");
        pokazPrzedmiotyUcznia(2L, em);
        System.out.println("\n");
        pokazUczniowNauczyciela(2L, em);
        System.out.println("");

        em.close();
        emf.close();

    }

}
