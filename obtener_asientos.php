<?php
require_once 'conexion.php';

$funcion = isset($_GET['funcion']) ? trim($_GET['funcion']) : '';

if ($funcion !== '') {
    $stmt = $conn->prepare("SELECT asientos FROM tickets WHERE funcion = ?");
    $stmt->bind_param("s", $funcion);
    $stmt->execute();
    $resultado = $stmt->get_result();
} else {
    $resultado = $conn->query("SELECT asientos FROM tickets");
}

$ocupados = [];

while ($fila = $resultado->fetch_assoc()) {
    $lista = explode(",", $fila['asientos']);
    foreach ($lista as $asiento) {
        $codigoLimpio = trim(str_replace("(VIP)", "", $asiento));
        if ($codigoLimpio !== '') {
            $ocupados[] = $codigoLimpio;
        }
    }
}

echo json_encode([
    "ok" => true,
    "ocupados" => array_values(array_unique($ocupados))
]);

$conn->close();
?>