<?php
/**
 * BKETO Calorie Counter — order email sender.
 * Sends a branded HTML email (with plain-text fallback) FROM
 * info@bluekarmasecrets.com to the guest, BCC'ing info@ for a record.
 *
 * Uses the server's local mail system (no SMTP password needed) because this
 * server is authoritative for bluekarmasecrets.com.
 */

require_once __DIR__ . '/lib-leads.php';

// ---- Config ----
const BKETO_FROM      = 'info@bluekarmasecrets.com';
const BKETO_FROM_NAME = 'BKETO Bali';
const BKETO_BCC       = 'info@bluekarmasecrets.com';
const BKETO_HOST_SUFFIX = 'bluekarmasecrets.com';
const BKETO_LOGO      = 'https://caloriecounterbketo.bluekarmasecrets.com/logo.png';
const BKETO_ACCENT    = '#105C80';

function bk_esc($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

/** Status pill colors by class. */
function bk_status_colors($cls) {
    switch ($cls) {
        case 'good': return ['#e7f6ee', '#1f7a53'];
        case 'warn': return ['#fdf1dd', '#a66612'];
        case 'bad':  return ['#fdecec', '#b23b3b'];
        default:     return ['#eef2f1', '#55655d'];
    }
}

/** Build the branded HTML email from a validated order array. */
function bk_render_html(array $o) {
    $accent = BKETO_ACCENT;
    $logo   = BKETO_LOGO;
    $dish   = $o['label'] !== '' ? bk_esc($o['label']) : 'Your BKETO meal';
    $goalLine = bk_esc(trim($o['goal'] . ($o['goalShort'] !== '' ? ' · ' . $o['goalShort'] : '')));

    // Ingredient rows
    $rows = '';
    foreach ($o['items'] as $it) {
        $name = bk_esc($it['name']);
        $por  = $it['por'] !== '' ? '<span class="soft" style="color:#8a988f;font-size:13px;"> · ' . bk_esc($it['por']) . '</span>' : '';
        $kcal = bk_esc($it['kcal']);
        $rows .=
            '<tr>' .
            '<td class="ink divide" style="padding:11px 0;border-bottom:1px solid #edf1ef;font-size:15px;color:#1c2b25;">' . $name . $por . '</td>' .
            '<td align="right" class="ink divide" style="padding:11px 0;border-bottom:1px solid #edf1ef;font-size:15px;color:#1c2b25;white-space:nowrap;font-variant-numeric:tabular-nums;">' . $kcal . ' kcal</td>' .
            '</tr>';
    }

    // Macro cells
    $macros = [
        ['Protein', $o['totals']['p']],
        ['Fat', $o['totals']['f']],
        ['Net carbs', $o['totals']['net']],
        ['Fibre', $o['totals']['fib']],
    ];
    $macroCells = '';
    foreach ($macros as $m) {
        $macroCells .=
            '<td align="center" style="padding:6px 4px;">' .
            '<div class="accent" style="font-size:22px;font-weight:bold;color:' . $accent . ';font-family:Helvetica,Arial,sans-serif;">' . bk_esc($m[1]) . '<span class="soft" style="font-size:13px;color:#8a988f;font-weight:normal;"> g</span></div>' .
            '<div class="soft" style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a988f;margin-top:3px;">' . bk_esc($m[0]) . '</div>' .
            '</td>';
    }

    // Split cells
    $splits = [
        ['Protein', $o['split']['protein']],
        ['Fat', $o['split']['fat']],
        ['Carbs', $o['split']['carbs']],
    ];
    $splitCells = '';
    foreach ($splits as $s) {
        $splitCells .=
            '<td align="center" style="padding:4px;">' .
            '<div class="ink" style="font-size:16px;font-weight:bold;color:#1c2b25;">' . bk_esc($s[1]) . '%</div>' .
            '<div class="soft" style="font-size:11px;color:#8a988f;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;">' . bk_esc($s[0]) . '</div>' .
            '</td>';
    }

    // Status pill
    $pill = '';
    if (!empty($o['status'])) {
        [$bg, $fg] = bk_status_colors($o['status']['cls']);
        $pill =
            '<div style="margin:14px 0 2px;"><span style="display:inline-block;background:' . $bg . ';color:' . $fg . ';font-size:13px;font-weight:bold;padding:6px 14px;border-radius:999px;">' .
            bk_esc($o['status']['text']) . '</span></div>';
    }

    // Reservation card (optional)
    $resv = '';
    if (!empty($o['reservation'])) {
        $r = $o['reservation'];
        $g = $r['guests'] !== '' ? bk_esc($r['guests']) : '—';
        $dd = $r['date'] !== '' ? bk_esc($r['date']) : '—';
        $tt = $r['time'] !== '' ? bk_esc($r['time']) : '—';
        $resv =
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;"><tr>' .
            '<td class="nutri" style="background:#f5f8f7;border-radius:12px;padding:12px 14px;">' .
            '<div class="soft" style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a988f;">Reservation request</div>' .
            '<div class="ink" style="font-size:14px;color:#1c2b25;margin-top:4px;">👥 ' . $g . ' &nbsp;·&nbsp; 📅 ' . $dd . ' &nbsp;·&nbsp; 🕐 ' . $tt . '</div>' .
            '</td></tr></table>';
    }

    $total = bk_esc($o['totals']['kcal']);
    $preheader = 'Your BKETO order — ' . $total . ' kcal';

    return <<<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Your BKETO order</title>
<style>
  body{margin:0;padding:0;background:#eef2f1;}
  .wrap{width:100%;background:#eef2f1;}
  .container{width:600px;max-width:600px;}
  a{color:{$accent};}
  @media (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:22px !important;padding-right:22px !important;}
  }
  @media (prefers-color-scheme:dark){
    body,.wrap{background:#0f1714 !important;}
    .card{background:#15201b !important;}
    .ink{color:#e9efec !important;}
    .soft{color:#9fb0a7 !important;}
    .accent{color:#4aa6cf !important;}
    .divide{border-color:#26332c !important;}
    .nutri{background:#101a15 !important;}
  }
</style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{$preheader}</div>
<table role="presentation" class="wrap" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f1;">
<tr><td align="center" style="padding:26px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

    <!-- Header -->
    <tr><td class="header" style="background:#ffffff;border-radius:18px 18px 0 0;border-bottom:3px solid {$accent};padding:22px 0;text-align:center;">
      <img src="{$logo}" width="132" alt="BKETO Bali" style="display:inline-block;height:auto;width:132px;max-width:60%;border:0;">
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a988f;margin-top:8px;">Calorie Counter · Seminyak, Bali</div>
    </td></tr>

    <!-- Intro -->
    <tr><td class="card px" style="background:#ffffff;padding:26px 34px 6px;font-family:Helvetica,Arial,sans-serif;">
      <div style="font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:{$accent};">Here is your order</div>
      <h1 class="ink" style="margin:6px 0 2px;font-size:24px;line-height:1.2;color:#15241e;font-weight:bold;">{$dish}</h1>
      <div class="soft" style="font-size:14px;color:#6a7b73;">{$goalLine}</div>
      {$pill}
      {$resv}
    </td></tr>

    <!-- Ingredients -->
    <tr><td class="card px" style="background:#ffffff;padding:14px 34px 4px;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        {$rows}
        <tr>
          <td class="ink" style="padding:14px 0 2px;font-size:16px;font-weight:bold;color:#15241e;">Total</td>
          <td align="right" class="accent" style="padding:14px 0 2px;font-size:20px;font-weight:bold;color:{$accent};white-space:nowrap;">{$total} kcal</td>
        </tr>
      </table>
    </td></tr>

    <!-- Nutrition card -->
    <tr><td class="card px" style="background:#ffffff;padding:12px 34px 6px;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" class="nutri" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8f7;border-radius:14px;">
        <tr><td style="padding:16px 12px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{$macroCells}</tr></table>
        </td></tr>
        <tr><td style="padding:0 16px 10px;">
          <div class="soft divide" style="text-align:center;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a988f;border-top:1px solid #e6ece9;padding-top:10px;">Calories from</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr>{$splitCells}</tr></table>
        </td></tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td class="card px" style="background:#ffffff;border-radius:0 0 18px 18px;padding:20px 34px 26px;font-family:Helvetica,Arial,sans-serif;">
      <div class="divide" style="border-top:1px solid #edf1ef;padding-top:16px;">
        <div class="ink" style="font-size:14px;font-weight:bold;color:#15241e;">BKETO Bali · Seminyak, Bali</div>
        <div class="soft" style="font-size:12px;color:#8a988f;margin-top:4px;line-height:1.6;">Figures are estimates per menu portion. Protein &amp; net carbs 4 kcal/g, fat 9 kcal/g, fibre 2 kcal/g.</div>
      </div>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>
HTML;
}

/** Plain-text fallback. */
function bk_render_text(array $o) {
    $lines = [];
    $lines[] = 'BKETO order';
    if ($o['label'] !== '') $lines[] = $o['label'];
    $lines[] = 'Goal: ' . trim($o['goal'] . ($o['goalShort'] !== '' ? ' · ' . $o['goalShort'] : ''));
    $lines[] = '';
    foreach ($o['items'] as $it) {
        $p = $it['por'] !== '' ? ' (' . $it['por'] . ')' : '';
        $lines[] = '• ' . $it['name'] . $p . ': ' . $it['kcal'] . ' kcal';
    }
    $lines[] = '';
    $lines[] = 'Total: ' . $o['totals']['kcal'] . ' kcal';
    $lines[] = 'Protein ' . $o['totals']['p'] . ' g · Fat ' . $o['totals']['f'] . ' g · Net carbs ' . $o['totals']['net'] . ' g · Fibre ' . $o['totals']['fib'] . ' g';
    $lines[] = 'Calories from protein ' . $o['split']['protein'] . '% · fat ' . $o['split']['fat'] . '% · carbs ' . $o['split']['carbs'] . '%';
    if (!empty($o['status'])) $lines[] = 'Status: ' . $o['status']['text'];
    if (!empty($o['reservation'])) {
        $r = $o['reservation'];
        $lines[] = '';
        $lines[] = 'Reservation: ' . ($r['guests'] !== '' ? $r['guests'] : '—') . ' guest(s) · ' .
            ($r['date'] !== '' ? $r['date'] : '—') . ' · ' . ($r['time'] !== '' ? $r['time'] : '—');
    }
    $lines[] = '';
    $lines[] = 'Estimates per menu portion.';
    $lines[] = '— BKETO Bali, Seminyak, Bali';
    return implode("\n", $lines);
}

/** Validate + normalise the posted order; returns array or null. */
function bk_parse_order($data) {
    if (!isset($data['order']) || !is_array($data['order'])) return null;
    $in = $data['order'];
    $clean = [];
    $clean['label']     = substr(preg_replace('/[\r\n]+/', ' ', (string)($in['label'] ?? '')), 0, 80);
    $clean['goal']      = substr(preg_replace('/[\r\n]+/', ' ', (string)($in['goal'] ?? '')), 0, 40);
    $clean['goalShort'] = substr(preg_replace('/[\r\n]+/', ' ', (string)($in['goalShort'] ?? '')), 0, 80);

    $items = $in['items'] ?? null;
    if (!is_array($items) || count($items) < 1 || count($items) > 40) return null;
    $clean['items'] = [];
    foreach ($items as $it) {
        if (!is_array($it)) return null;
        $clean['items'][] = [
            'name' => substr(preg_replace('/[\r\n]+/', ' ', (string)($it['name'] ?? '')), 0, 120),
            'por'  => substr(preg_replace('/[\r\n]+/', ' ', (string)($it['por'] ?? '')), 0, 40),
            'kcal' => (int)($it['kcal'] ?? 0),
        ];
    }

    $t = $in['totals'] ?? [];
    $clean['totals'] = [
        'kcal' => (int)($t['kcal'] ?? 0),
        'p'    => (int)($t['p'] ?? 0),
        'f'    => (int)($t['f'] ?? 0),
        'net'  => (int)($t['net'] ?? 0),
        'fib'  => (int)($t['fib'] ?? 0),
    ];
    if ($clean['totals']['kcal'] <= 0 || $clean['totals']['kcal'] > 20000) return null;

    $sp = $in['split'] ?? [];
    $clean['split'] = [
        'protein' => max(0, min(100, (int)($sp['protein'] ?? 0))),
        'fat'     => max(0, min(100, (int)($sp['fat'] ?? 0))),
        'carbs'   => max(0, min(100, (int)($sp['carbs'] ?? 0))),
    ];

    $clean['status'] = null;
    if (isset($in['status']) && is_array($in['status'])) {
        $cls = (string)($in['status']['cls'] ?? '');
        if (in_array($cls, ['good', 'warn', 'bad'], true)) {
            $clean['status'] = [
                'text' => substr(preg_replace('/[\r\n]+/', ' ', (string)($in['status']['text'] ?? '')), 0, 60),
                'cls'  => $cls,
            ];
        }
    }

    $clean['reservation'] = null;
    if (isset($in['reservation']) && is_array($in['reservation'])) {
        $r = $in['reservation'];
        $g  = substr(preg_replace('/[\r\n]+/', ' ', (string)($r['guests'] ?? '')), 0, 12);
        $dd = substr(preg_replace('/[\r\n]+/', ' ', (string)($r['date'] ?? '')), 0, 40);
        $tt = substr(preg_replace('/[\r\n]+/', ' ', (string)($r['time'] ?? '')), 0, 20);
        if ($g !== '' || $dd !== '' || $tt !== '') {
            $clean['reservation'] = ['guests' => $g, 'date' => $dd, 'time' => $tt];
        }
    }
    return $clean;
}

// ---------------------------------------------------------------------------
// Request handling (skipped when included for testing).
// ---------------------------------------------------------------------------
if (!defined('BKETO_EMAIL_TEST')) {
    bk_main();
}

function bk_fail($code, $msg) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

function bk_main() {
    header('Content-Type: application/json; charset=UTF-8');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $originOk = false;
    if ($origin !== '') {
        $h = parse_url($origin, PHP_URL_HOST);
        if ($h && substr($h, -strlen(BKETO_HOST_SUFFIX)) === BKETO_HOST_SUFFIX) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            $originOk = true;
        }
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'OPTIONS') { http_response_code(204); exit; }
    if ($method !== 'POST') bk_fail(405, 'Method not allowed');
    if ($origin !== '' && !$originOk) bk_fail(403, 'Forbidden');

    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 12000) bk_fail(413, 'Request too large');
    $data = json_decode($raw, true);
    if (!is_array($data)) bk_fail(400, 'Bad request');

    $to = trim((string)($data['to'] ?? ''));
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) bk_fail(422, 'Invalid email address');

    // Rate limit (max 8/hour per IP)
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
    if (count($hits) >= $max) bk_fail(429, 'Too many requests — please try again later');
    $hits[] = $now;
    @file_put_contents($bucket, implode(',', $hits), LOCK_EX);

    $order = bk_parse_order($data);

    if ($order !== null) {
        $subject = 'Your BKETO order' . ($order['label'] !== '' ? ' — ' . $order['label'] : '');
        $html = bk_render_html($order);
        $text = bk_render_text($order);
    } else {
        // Backward-compatible plain-text path (older app build).
        $summary = str_replace(["\r\n", "\r"], "\n", (string)($data['summary'] ?? ''));
        if (strlen($summary) < 10 || strlen($summary) > 4000 || stripos($summary, 'kcal') === false) {
            bk_fail(422, 'Invalid order');
        }
        $label = substr(preg_replace('/[\r\n]+/', ' ', (string)($data['label'] ?? '')), 0, 80);
        $subject = 'Your BKETO order' . ($label !== '' ? ' — ' . $label : '');
        $html = null;
        $text = "Thanks for using the BKETO Calorie Counter!\n\nHere is your order:\n\n" . $summary .
                "\n\n— BKETO Bali\nSeminyak, Bali";
    }

    $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    if ($html !== null) {
        $boundary = '=_bk_' . md5(uniqid('', true));
        $headers = implode("\r\n", [
            'From: ' . BKETO_FROM_NAME . ' <' . BKETO_FROM . '>',
            'Reply-To: ' . BKETO_FROM,
            'Bcc: ' . BKETO_BCC,
            'MIME-Version: 1.0',
            'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
            'X-Mailer: BKETO-CalorieCounter',
        ]);
        $body =
            "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n" . $text . "\r\n\r\n" .
            "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n" . $html . "\r\n\r\n" .
            "--$boundary--";
    } else {
        $headers = implode("\r\n", [
            'From: ' . BKETO_FROM_NAME . ' <' . BKETO_FROM . '>',
            'Reply-To: ' . BKETO_FROM,
            'Bcc: ' . BKETO_BCC,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: BKETO-CalorieCounter',
        ]);
        $body = $text;
    }

    $sent = @mail($to, $encSubject, $body, $headers, '-f ' . BKETO_FROM);
    if (!$sent) bk_fail(500, 'Could not send the email right now');

    if ($order !== null) {
        @bk_store_lead(bk_flatten_lead('email', $to, '', $order['reservation'] ?? [], $order));
    }

    echo json_encode(['ok' => true]);
}
