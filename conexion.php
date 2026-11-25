<?php
header('Content-Type: application/json; charset=utf-8');

$host = "localhost";
$usuario = "root";
$password = "";
$base_datos = "star_cast_cinema";

$conn = new mysqli($host, $usuario, $password, $base_datos);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de conexión a MySQL: " . $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>