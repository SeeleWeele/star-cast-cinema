<?php
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok" => false, "mensaje" => "Método no permitido."]);
    exit;
}

$nombre   = trim($_POST['nombre'] ?? '');
$correo   = trim($_POST['correo'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$asunto   = trim($_POST['asunto'] ?? '');
$mensaje  = trim($_POST['mensaje'] ?? '');

if (strlen($nombre) < 5 || !filter_var($correo, FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9]{10}$/', $telefono) || $asunto === '' || strlen($mensaje) < 10) {
    http_response_code(400);
    echo json_encode(["ok" => false, "mensaje" => "Por favor verifica todos los campos obligatorios."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO mensajes_contacto (nombre, correo, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $nombre, $correo, $telefono, $asunto, $mensaje);

if ($stmt->execute()) {
    echo json_encode([
        "ok" => true,
        "mensaje" => "¡Gracias {$nombre}! Tu mensaje fue registrado en nuestra base de datos."
    ]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "mensaje" => "Error al registrar el mensaje: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>