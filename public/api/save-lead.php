<?php
/**
 * Capture a guest lead (WhatsApp / Reserve) into the private CSV store.
 * Fire-and-forget from the app when the guest taps an action button.
 */
require_once __DIR__ . '/lib-leads.php';
header('Content-Type: application/json; charset=UTF-8');

[$originOk, $origin] = bk_leads_origin_ok();
if ($origin !== '') {
    if (!$originOk) { http_response_code(403); echo json_encode(['ok' => false]); exit; }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if ($method !== 'POST') { http_response_code(405); echo json_encode(['ok' => false]); exit; }

if (!bk_leads_rate_ok('lead', 40)) { http_response_code(429); echo json_encode(['ok' => false]); exit; }

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 12000) { http_response_code(413); echo json_encode(['ok' => false]); exit; }
$data = json_decode($raw, true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['ok' => false]); exit; }

$channel = (string)($data['channel'] ?? 'other');
if (!in_array($channel, ['whatsapp', 'reserve', 'email'], true)) $channel = 'other';

$email = trim((string)($data['email'] ?? ''));
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';
$phone = preg_replace('/[^\d+]/', '', (string)($data['phone'] ?? ''));

$order = is_array($data['order'] ?? null) ? $data['order'] : [];
// Must look like a real order (light anti-abuse).
if ((int)($order['totals']['kcal'] ?? 0) <= 0) { http_response_code(422); echo json_encode(['ok' => false]); exit; }

$reservation = [
    'guests' => (string)($data['guests'] ?? ''),
    'date'   => (string)($data['date'] ?? ''),
    'time'   => (string)($data['time'] ?? ''),
];

$row = bk_flatten_lead($channel, $email, $phone, $reservation, $order);
$ok = bk_store_lead($row);
echo json_encode(['ok' => (bool)$ok]);
