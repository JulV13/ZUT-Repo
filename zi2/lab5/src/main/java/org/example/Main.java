package org.example;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.persistence.Query;

import java.util.List;
import java.util.Random;

public class Main {
    public static void main(String[] args){
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("xd");
        EntityManager em = emf.createEntityManager();
        Random rand = new Random();
        /*
        Person p1 =  new Person();
        Person p2 =  new Person();
        Person p3 =  new Person();
        p1.setAge(rand.nextInt(50) + 1);
        p1.setFirstName("Jacek");
        p1.setFamilyName("Kowalski");
        p2.setAge(rand.nextInt(50) + 1);
        p2.setFirstName("Maciej");
        p2.setFamilyName("Gorka");
        p3.setAge(rand.nextInt(50) + 1);
        p3.setFirstName("Filip");
        p3.setFamilyName("Lamper");
        em.getTransaction().begin();
        em.persist(p1);
        em.persist(p2);
        em.persist(p3);
        em.getTransaction().commit();
        */

        /*
        Query q1 = em.createQuery("select p FROM Person p", Person.class);
        List<Person> people = q1.getResultList();
        for(Person prsn : people){
            if (prsn.getAge() < 18){
                prsn.setAge(18);
                em.getTransaction().begin();
                em.persist(prsn);
                em.getTransaction().commit();
            }
            System.out.println(prsn.getFirstName() + " " + prsn.getFamilyName() + ", age: " + prsn.getAge());
        }
        */

        Query query = em.createQuery("SELECT p FROM Person p WHERE p.age > 25");
        List<Person> persons = query.getResultList();
        System.out.println("Number of people with age > 25: " + persons.size());
    }
}
