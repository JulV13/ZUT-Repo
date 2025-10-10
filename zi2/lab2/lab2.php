<?php
# 1 - polaczenie z baza danych za pomoca PDO
$db = new PDO('mysql:host=null;dbname=null;charset=utf8', 'null', 'null');

# 6 - testowanie roznych trybow raportowania bledow
//$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
//$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

# 2 - utworzenie tabeli w bazie danych z odpowiednimi polami i parametrami
$db->exec("create table if not exists lab2 (
    id int PRIMARY KEY AUTO_INCREMENT NOT NULL,
    znak VARCHAR(255) NOT NULL,
    liczba int NOT NULL
)");

# 3 - wykonanie zapytania usuwajacego wszystkie rekordy z tabeli
$db->exec("DELETE FROM `lab2`");

# 7 - rozpoczecie transakcji
//$db->beginTransaction();

# 4 - utworzenie tablicy wartosci dla pola 'znak'
$tablica = array("jeden","dwa","trzy","cztery",null,"szesc","siedem","osiem","dziewiec","dziesiec");
# przygotowanie zapytania dodajacego rekord do tabeli
$zapytanie = $db->prepare("INSERT INTO `lab2` (`znak`,`liczba`) VALUES (?,rand()*10)");
# dla kazdego elementu tablicy wykonanie zapytania podstawiajacego element jako wartosc pola 'znak'
foreach($tablica as $element) {
    $zapytanie->execute(array($element));
}

# 7 - zatwierdzenie transakcji
//$db->commit();

# 5
# wykonanie zapytania pobierajacego wszystkie rekordy z tabeli
$wynik = $db->query("SELECT * FROM `lab2` WHERE `znak` IS NOT NULL ORDER BY `liczba` DESC");
# pobranie wszystkich rekordow do tablicy
$dane = $wynik->fetchAll();
# wyswietlenie wszystkich rekordow
foreach($dane as $rekord) {
    echo "id: ".$rekord['id'].", znak: ".$rekord['znak'].", liczba: ".$rekord['liczba']."\n";
}
# zamkniecie polaczenia z baza danych
$db = null;
?>