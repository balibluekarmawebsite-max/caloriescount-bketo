<?php
/**
 * BKETO Calorie Counter — order email sender.
 * Sends the order summary FROM info@bluekarmasecrets.com to the guest's email,
 * with a BCC copy back to info@ so BKETO keeps a record.
 *
 * Uses the server's local mail system (no SMTP password needed) because this
 * server is authoritative for bluekarmasecrets.com.
 */

header('Content-Type: application/json; charset=UTF-8');

// ---- Config ----
$FROM       = 'info@bluekarmasecrets.com';
$FROM_NAME  = 'BKETO Bali';
$BCC        = 'info@bluekarmasecrets.com'; // keep a copy for BKETO
$HOST_SUFFIX = 'bluekarmasecrets.com';     // only accept requests from our own site

// ---- Same-site origin guard ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$originOk = false;
if ($origin !== '') {
    $h = parse_url($origin, PHP_URL_HOST);
    if ($h && substr($h, -strlen($HOST_SUFFIX)) === $HOST_SUFFIX) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        $originOk = true;
    }
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') { http_response_code(204); exit; }

function fail($code, $msg) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

if ($method !== 'POST') fail(405, 'Method not allowed');
if ($origin !== '' && !$originOk) fail(403, 'Forbidden');

// ---- Read + validate input ----
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 8000) fail(413, 'Request too large');
$data = json_decode($raw, true);
if (!is_array($data)) fail(400, 'Bad request');

$to      = trim((string)($data['to'] ?? ''));
$summary = (string)($data['summary'] ?? '');
$label   = trim((string)($data['label'] ?? ''));

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) fail(422, 'Invalid email address');

$summary = str_replace(["\r\n", "\r"], "\n", $summary);
if (strlen($summary) < 10 || strlen($summary) > 4000) fail(422, 'Invalid summary');
// Must look like a real order (light anti-abuse).
if (stripos($summary, 'kcal') === false) fail(422, 'Invalid summary');
$label = substr(preg_replace('/[\r\n]+/', ' ', $label), 0, 80);

// ---- Simple per-IP rate limit (max 8 / hour) ----
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$bucket = sys_get_temp_dir() . '/bketo_mail_' . md5($ip);
$now = time(); $window = 3600; $max = 8;
$hits = [];
if (is_file($bucket)) {
    $hits = array_filter(
        array_map('intval', explode(',', (string)@file_get_contents($bucket))),
        function ($t) use ($now, $window) { return $t > $now - $window; }
    );
}
if (count($hits) >= $max) fail(429, 'Too many requests — please try again later');
$hits[] = $now;
@file_put_contents($bucket, implode(',', $hits), LOCK_EX);

// ---- Compose ----
$subject = 'Your BKETO order' . ($label !== '' ? ' — ' . $label : '');
$body =
    "Thanks for using the BKETO Calorie Counter!\n\n" .
    "Here is your order:\n\n" .
    $summary .
    "\n\n— " . $FROM_NAME . "\nSeminyak, Bali";

$encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$headers = implode("\r\n", [
    'From: ' . $FROM_NAME . ' <' . $FROM . '>',
    'Reply-To: ' . $FROM,
    'Bcc: ' . $BCC,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: BKETO-CalorieCounter',
]);

$sent = @mail($to, $encSubject, $body, $headers, '-f ' . $FROM);
if (!$sent) fail(500, 'Could not send the email right now');

echo json_encode(['ok' => true]);
