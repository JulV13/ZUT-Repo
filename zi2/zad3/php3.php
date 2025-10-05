<?php

    $mysqli = mysqli_connect("","","","");
    $res = mysqli_query($mysqli, "select * from tabela");

    while($row = $res->fetch_array()){
        echo $row['napis'] . "\n";
    }

?>