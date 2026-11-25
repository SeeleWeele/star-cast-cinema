<?php
require_once 'conexion.php';

$busqueda = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($busqueda !== '') {
    $like = "%" . $busqueda . "%";
    $stmt = $conn->prepare("SELECT id, folio, nombre_cliente, correo, celular, funcion, asientos, detalle_zona, total, notas, DATE_FORMAT(fecha_compra, '%d/%m/%Y %H:%i') AS fecha FROM tickets WHERE folio LIKE ? OR nombre_cliente LIKE ? OR funcion LIKE ? ORDER BY id DESC");
    $stmt->bind_param("sss", $like, $like, $like);
    $stmt->execute();
    $resTickets = $stmt->get_result();
} else {
    $resTickets = $conn->query("SELECT id, folio, nombre_cliente, correo, celular, funcion, asientos, detalle_zona, total, notas, DATE_FORMAT(fecha_compra, '%d/%m/%Y %H:%i') AS fecha FROM tickets ORDER BY id DESC");
}

$tickets = [];
$ingresosTotales = 0;
while ($row = $resTickets->fetch_assoc()) {
    $tickets[] = $row;
    $ingresosTotales += floatval($row['total']);
}

$resMensajes = $conn->query("SELECT id, nombre, correo, telefono, asunto, mensaje, DATE_FORMAT(fecha_envio, '%d/%m/%Y %H:%i') AS fecha FROM mensajes_contacto ORDER BY id DESC");
$mensajes = [];
while ($row = $resMensajes->fetch_assoc()) {
    $mensajes[] = $row;
}

$resFunciones = $conn->query("SELECT id, titulo, genero, horarios, precio_general, precio_vip FROM funciones ORDER BY id ASC");
$funciones = [];
while ($row = $resFunciones->fetch_assoc()) {
    $funciones[] = $row;
}

echo json_encode([
    "ok" => true,
    "resumen" => [
        "total_tickets" => count($tickets),
        "ingresos" => number_format($ingresosTotales, 2, '.', ''),
        "total_mensajes" => count($mensajes)
    ],
    "tickets" => $tickets,
    "mensajes" => $mensajes,
    "funciones" => $funciones
]);

$conn->close();
?>