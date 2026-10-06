<?php
/**
 * ============================================================
 *  Приём заявок с формы -> сообщение в Telegram (PHP-версия)
 *  Для обычного хостинга с PHP: Timeweb, Beget, REG.RU и т.п.
 * ============================================================
 *  В js/config.js: formEndpoint: "/api/lead.php"
 *
 *  Токен и chat id лежат в api/lead-config.php (в git не попадает).
 *  Скопируйте api/lead-config.example.php -> api/lead-config.php
 *  и впишите свои значения.
 *
 *  Заявки нигде не сохраняются — только пересылаются в Telegram.
 * ============================================================
 */
header('Content-Type: application/json; charset=utf-8');

function respond($body, $status = 200) {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// одна строка: убираем управляющие символы и обрезаем длину
function clean_line($v, $max) {
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string)$v);
    return mb_substr(trim($v), 0, $max);
}

// многострочный текст (комментарий): переносы строк сохраняем
function clean_text($v, $max) {
    $v = str_replace(["\r\n", "\r"], "\n", (string)$v);
    $v = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', $v);
    return mb_substr(trim($v), 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'method_not_allowed'], 405);

$cfgFile = __DIR__ . '/lead-config.php';
if (!is_file($cfgFile)) respond(['ok' => false, 'error' => 'not_configured'], 500);
$cfg = require $cfgFile;
$token = isset($cfg['telegram_bot_token']) ? $cfg['telegram_bot_token'] : '';
$chatId = isset($cfg['telegram_chat_id']) ? $cfg['telegram_chat_id'] : '';
if (!$token || !$chatId) respond(['ok' => false, 'error' => 'not_configured'], 500);

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) respond(['ok' => false, 'error' => 'bad_json'], 400);

// ловушка для спам-ботов: скрытое поле, живой человек его не заполняет
if (!empty($data['website'])) respond(['ok' => true]);

$name = clean_line(isset($data['name']) ? $data['name'] : '', 100);
$phone = clean_line(isset($data['phone']) ? $data['phone'] : '', 30);
$center = clean_line(isset($data['center']) ? $data['center'] : '', 200);
$service = clean_line(isset($data['service']) ? $data['service'] : '', 150);
$comment = clean_text(isset($data['comment']) ? $data['comment'] : '', 1000);

if (mb_strlen($name) < 2 || strlen(preg_replace('/\D/', '', $phone)) !== 11) {
    respond(['ok' => false, 'error' => 'validation'], 422);
}

$site = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$lines = ['🚗 Новая заявка с сайта ' . $site, '', 'Имя: ' . $name, 'Телефон: ' . $phone];
if ($center !== '') $lines[] = 'Центр: ' . $center;
if ($service !== '') $lines[] = 'Услуга: ' . $service;
if ($comment !== '') $lines[] = "\nКомментарий:\n" . $comment;

$payload = json_encode([
    'chat_id' => $chatId,
    'text' => implode("\n", $lines),
    'disable_web_page_preview' => true
], JSON_UNESCAPED_UNICODE);

$ctx = stream_context_create(['http' => [
    'method' => 'POST',
    'header' => "Content-Type: application/json\r\n",
    'content' => $payload,
    'timeout' => 10,
    'ignore_errors' => true
]]);
$result = @file_get_contents('https://api.telegram.org/bot' . $token . '/sendMessage', false, $ctx);
$answer = $result ? json_decode($result, true) : null;
if (!$answer || empty($answer['ok'])) respond(['ok' => false, 'error' => 'telegram_error'], 502);

respond(['ok' => true]);
