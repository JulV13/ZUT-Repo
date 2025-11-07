package org.example;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Person {
    @Id
    @GeneratedValue
    private Long id;
    private String firstName;
    private String familyName;
    private Integer age;

    public Long getId() { return id;}
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getFamilyName() { return familyName; }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public Integer getAge() { return age; }

    public void setAge(int age) { this.age = age; }
}
