<?php

    $db = new mysqli("","","","");

    $db->query("create table if not exists tabela (liczba int, napis text)");
    $db->query("insert into tabela values (123, 'abc')");

    $res = $db->query("select * from tabela");

    while($row = $res->fetch_array()){
        echo $row['napis'] . ' - ' . $row['liczba'] . "\n";
    }

?>