<?php
/**
 * Shared lead-storage helpers for the BKETO Calorie Counter.
 * Captured guest contacts + order/reservation details are appended to a CSV
 * stored OUTSIDE the web root (~/bketo-leads/leads.csv), so it is private.
 */

const BKETO_LEADS_HOST_SUFFIX = 'bluekarmasecrets.com';

/** The cPanel account home directory. */
function bk_home() {
    $h = getenv('HOME');
    if ($h && is_dir($h)) return $h;
    if (function_exists('posix_getpwuid')) {
        $pw = @posix_getpwuid(posix_getuid());
        if ($pw && !empty($pw['dir']) && is_dir($pw['dir'])) return $pw['dir'];
    }
    return dirname(__DIR__, 3); // best-effort fallback (…/home/<user>)
}

/** Private storage directory (created on first use). */
function bk_leads_dir() {
    $dir = bk_home() . '/bketo-leads';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

/** Only accept writes triggered from our own site. */
function bk_leads_origin_ok() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return [true, '']; // non-browser / same-origin (no CORS)
    $h = parse_url($origin, PHP_URL_HOST);
    if ($h && substr($h, -strlen(BKETO_LEADS_HOST_SUFFIX)) === BKETO_LEADS_HOST_SUFFIX) {
        return [true, $origin];
    }
    return [false, $origin];
}

/** Simple per-IP rate limit (shared buckets in the system temp dir). */
function bk_leads_rate_ok($tag, $max, $window = 3600) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0';
    $bucket = sys_get_temp_dir() . '/bketo_' . $tag . '_' . md5($ip);
    $now = time();
    $hits = [];
    if (is_file($bucket)) {
        $hits = array_filter(
            array_map('intval', explode(',', (string)@file_get_contents($bucket))),
            function ($t) use ($now, $window) { return $t > $now - $window; }
        );
    }
    if (count($hits) >= $max) return false;
    $hits[] = $now;
    @file_put_contents($bucket, implode(',', $hits), LOCK_EX);
    return true;
}

function bk_leads_clean($s, $max = 200) {
    return substr(preg_replace('/[\r\n\t]+/', ' ', (string)$s), 0, $max);
}

/** Flatten an order payload + contact + reservation into one CSV row. */
function bk_flatten_lead($channel, $email, $phone, $reservation, $order) {
    $items = '';
    if (!empty($order['items']) && is_array($order['items'])) {
        $names = [];
        foreach ($order['items'] as $it) {
            if (is_array($it) && isset($it['name'])) $names[] = $it['name'];
        }
        $items = implode('; ', $names);
    }
    return [
        'timestamp'  => date('c'),
        'channel'    => bk_leads_clean($channel, 20),
        'email'      => bk_leads_clean($email, 120),
        'phone'      => bk_leads_clean($phone, 24),
        'guests'     => bk_leads_clean($reservation['guests'] ?? '', 12),
        'date'       => bk_leads_clean($reservation['date'] ?? '', 40),
        'time'       => bk_leads_clean($reservation['time'] ?? '', 20),
        'dish'       => bk_leads_clean($order['label'] ?? '', 80),
        'goal'       => bk_leads_clean($order['goal'] ?? '', 40),
        'total_kcal' => (int)($order['totals']['kcal'] ?? 0),
        'items'      => bk_leads_clean($items, 400),
    ];
}

/** Append one lead row to the CSV (creates header on first write). */
function bk_store_lead(array $row) {
    $dir = bk_leads_dir();
    if (!is_dir($dir)) return false;
    $file = $dir . '/leads.csv';
    $new = !is_file($file);
    $fh = @fopen($file, 'a');
    if (!$fh) return false;
    if (flock($fh, LOCK_EX)) {
        if ($new) {
            fputcsv($fh, array_keys($row));
            @chmod($file, 0600);
        }
        fputcsv($fh, array_values($row));
        fflush($fh);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
    return true;
}
