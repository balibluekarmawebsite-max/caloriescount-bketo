<?php
/**
 * BKETO leads — private admin viewer / CSV download.
 *
 * Protected by a token you set in ~/bketo-leads/config.php :
 *   <?php return ['token' => 'choose-a-long-secret'];
 *
 * Then open:  /api/admin-leads.php   (enter the token)
 */
require_once __DIR__ . '/lib-leads.php';

$cfgFile = bk_leads_dir() . '/config.php';
$token = '';
if (is_file($cfgFile)) {
    $cfg = include $cfgFile;
    if (is_array($cfg)) $token = (string)($cfg['token'] ?? '');
}

$csv = bk_leads_dir() . '/leads.csv';

function page($body) {
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>BKETO leads</title><style>'
        . 'body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;background:#eef2f1;color:#17241e;}'
        . '.wrap{max-width:1100px;margin:0 auto;padding:24px 16px;}'
        . 'h1{font-size:20px;margin:0 0 4px;} .muted{color:#6a7b73;font-size:13px;}'
        . '.card{background:#fff;border:1px solid #e3ece8;border-radius:14px;padding:18px;margin-top:16px;box-shadow:0 8px 24px -16px rgba(16,48,36,.3);}'
        . 'input[type=password],input[type=text]{padding:11px 12px;border:1px solid #cfdad5;border-radius:10px;width:260px;max-width:100%;}'
        . 'button,.btn{display:inline-block;padding:10px 16px;border-radius:10px;border:none;background:#105C80;color:#fff;font-weight:600;text-decoration:none;cursor:pointer;}'
        . 'table{border-collapse:collapse;width:100%;font-size:13px;}'
        . 'th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #eef1ef;white-space:nowrap;}'
        . 'th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6a7b73;}'
        . 'tr:hover td{background:#f6f9f8;} .scroll{overflow:auto;max-height:70vh;}'
        . '</style></head><body><div class="wrap">' . $body . '</div></body></html>';
}

if ($token === '') {
    http_response_code(503);
    page('<h1>BKETO leads</h1><div class="card"><p><b>Not set up yet.</b></p>'
        . '<p class="muted">Create this file on the server to enable the viewer:</p>'
        . '<pre>' . htmlspecialchars(bk_leads_dir() . '/config.php') . "\n\n"
        . htmlspecialchars("<?php return ['token' => 'choose-a-long-secret'];") . '</pre></div>');
    exit;
}

$provided = (string)($_REQUEST['token'] ?? '');
$authed = $provided !== '' && hash_equals($token, $provided);

if (!$authed) {
    http_response_code($provided === '' ? 200 : 403);
    page('<h1>BKETO leads</h1><div class="card"><form method="post">'
        . '<p class="muted">Enter the access token.</p>'
        . '<input type="password" name="token" autofocus placeholder="Access token"> '
        . '<button type="submit">Open</button>'
        . ($provided !== '' ? '<p class="muted" style="color:#b23b3b">Wrong token.</p>' : '')
        . '</form></div>');
    exit;
}

// Download
if (isset($_GET['dl'])) {
    if (!is_file($csv)) { http_response_code(404); echo 'No leads yet.'; exit; }
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="bketo-leads.csv"');
    readfile($csv);
    exit;
}

// View
$rows = [];
if (is_file($csv) && ($fh = fopen($csv, 'r'))) {
    while (($r = fgetcsv($fh)) !== false) $rows[] = $r;
    fclose($fh);
}
$header = $rows ? array_shift($rows) : [];
$rows = array_reverse($rows); // newest first

$t = htmlspecialchars($provided);
$body = '<h1>BKETO leads</h1><div class="muted">' . count($rows) . ' entries · stored at ' . htmlspecialchars($csv) . '</div>';
$body .= '<div class="card"><p><a class="btn" href="?dl=1&token=' . urlencode($provided) . '">Download CSV</a></p>';
if (!$rows) {
    $body .= '<p class="muted">No leads captured yet.</p>';
} else {
    $body .= '<div class="scroll"><table><thead><tr>';
    foreach ($header as $h) $body .= '<th>' . htmlspecialchars($h) . '</th>';
    $body .= '</tr></thead><tbody>';
    foreach ($rows as $r) {
        $body .= '<tr>';
        foreach ($r as $c) $body .= '<td>' . htmlspecialchars($c) . '</td>';
        $body .= '</tr>';
    }
    $body .= '</tbody></table></div>';
}
$body .= '</div>';
page($body);
