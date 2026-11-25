<?php
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok" => false, "mensaje" => "Método no permitido."]);
    exit;
}

$nombre   = trim($_POST['nombre'] ?? '');
$correo   = trim($_POST['correo'] ?? '');
$celular  = trim($_POST['celular'] ?? '');
$funcion  = trim($_POST['funcion'] ?? '');
$asientos = trim($_POST['asientos'] ?? '');
$zona     = trim($_POST['zona'] ?? '');
$total    = floatval($_POST['total'] ?? 0);
$notas    = trim($_POST['notas'] ?? '');

if (strlen($nombre) < 5 || !filter_var($correo, FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9]{10}$/', $celular) || $funcion === '' || $asientos === '') {
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Datos incompletos o inválidos en el servidor."]);
    exit;
}

$resId = $conn->query("SELECT IFNULL(MAX(id), 0) + 1001 AS siguiente FROM tickets");
$rowId = $resId->fetch_assoc();
$folio = "#SCC-" . $rowId['siguiente'];

$stmt = $conn->prepare("INSERT INTO tickets (folio, nombre_cliente, correo, celular, funcion, asientos, detalle_zona, total, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssssds", $folio, $nombre, $correo, $celular, $funcion, $asientos, $zona, $total, $notas);

if ($stmt->execute()) {
    echo json_encode([
        "ok" => true,
        "folio" => $folio,
        "fecha" => date("d/m/Y H:i:s"),
        "mensaje" => "Ticket guardado en la base de datos correctamente."
    ]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "mensaje" => "Error al guardar el ticket: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>