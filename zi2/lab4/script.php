<?php
require_once __DIR__ . '/vendor/autoload.php';

use \Doctrine\DBAL\DriverManager;
use \Doctrine\DBAL\Schema\Schema;

$params = [
    'dbname' => '',
    'user' => '',
    'password' => '',
    'host' => '',
    'driver' => 'pdo_mysql'
];

$conn = DriverManager::getConnection($params);

$queryBuilder = $conn->createQueryBuilder();

$res = $queryBuilder
    ->select('customerName', 'creditLimit')
    ->from('customers')
    ->where('country = :country')
    ->setParameter('country', 'USA')
    ->orderBy('creditLimit', 'DESC')
    ->fetchAllAssociative();

foreach ($res as $row) {
    echo $row['customerName'] . ': ' . $row['creditLimit'] . "\n";
}

$res2 = $queryBuilder
    ->select('c.customerNumber', 'c.customerName', 'e.firstName', 'e.lastName')
    ->from('customers', 'c')
    ->innerJoin('c', 'employees', 'e', 'c.salesRepEmployeeNumber = e.employeeNumber')
    ->fetchAllAssociative();

foreach ($res2 as $row) {
    echo $row['customerNumber'] . ': ' . $row['customerName'] . 
    ' | Opiekun handlowy: ' . $row['firstName'] . ' ' . $row['lastName'] . "\n";
}
    
$schemaManager = $conn->createSchemaManager();
$schema = new Schema();

$table = $schema->createTable('nowa_tabela');
$table->addColumn('id', 'integer', ['unsigned' => true, 'autoincrement' => true]);
$table->addColumn('napis', 'string', ['length' => 255]);
$table->addColumn('liczba', 'integer');
$table->setPrimaryKey(['id']);

$sql = $schema->toSql($conn->getDatabasePlatform());

$conn->executeStatement($sql[0]);


$queryBuilder = $conn->createQueryBuilder();

$queryBuilder
    ->insert('nowa_tabela')
    ->values([
        'napis' => ':napis',
        'liczba' => ':liczba',
    ])
    ->setParameter('napis', 'Pierwsze')
    ->setParameter('liczba', 111)
    ->executeStatement();

$queryBuilder
    ->insert('nowa_tabela')
    ->values([
        'napis' => ':napis',
        'liczba' => ':liczba',
    ])
    ->setParameter('napis', 'Drugie')
    ->setParameter('liczba', 222)
    ->executeStatement();

$queryBuilder
    ->insert('nowa_tabela')
    ->values([
        'napis' => ':napis',
        'liczba' => ':liczba',
    ])
    ->setParameter('napis', 'Trzecie')
    ->setParameter('liczba', 333)
    ->executeStatement();

?>