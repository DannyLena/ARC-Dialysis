<?php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// ── Configuration ────────────────────────────────────────────────────────────
define('ARC_TO_EMAIL',         'dannylena@bpsgusa.com');
define('ARC_FROM_EMAIL',       'dannylena@bpsgusa.com');
define('ARC_RECAPTCHA_SECRET', '6LflwY4sAAAAAOD8EdP7wwMMmb2nlnv5pMnfnDA0');
define('ARC_RECAPTCHA_MIN_SCORE', 0.5);

// ── Helpers ──────────────────────────────────────────────────────────────────
function arc_clean($value) {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function arc_json($status, $message) {
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

// ── Method check ─────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    arc_json('false', 'Invalid request method.');
}

// ── reCAPTCHA v3 verification ────────────────────────────────────────────────
$recaptcha_token = isset($_POST['recaptcha_token']) ? trim($_POST['recaptcha_token']) : '';

if (empty($recaptcha_token)) {
    arc_json('false', 'Security verification failed. Please refresh the page and try again.');
}

$recaptcha_response = @file_get_contents(
    'https://www.google.com/recaptcha/api/siteverify?secret=' .
    urlencode(ARC_RECAPTCHA_SECRET) . '&response=' . urlencode($recaptcha_token)
);

if ($recaptcha_response === false) {
    $recaptcha_score = 1.0;
} else {
    $recaptcha_data  = json_decode($recaptcha_response, true);
    $recaptcha_score = isset($recaptcha_data['score']) ? (float)$recaptcha_data['score'] : 0.0;
    $recaptcha_ok    = isset($recaptcha_data['success']) ? (bool)$recaptcha_data['success'] : false;

    if (!$recaptcha_ok || $recaptcha_score < ARC_RECAPTCHA_MIN_SCORE) {
        arc_json('false', 'Security verification failed. Please try again.');
    }
}

// ── Collect & sanitize fields ────────────────────────────────────────────────
$name          = arc_clean($_POST['form_name']                   ?? '');
$phone         = arc_clean($_POST['form_phone']                  ?? '');
$email         = arc_clean($_POST['form_email']                  ?? '');
$location      = arc_clean($_POST['form_location']               ?? '');
$chair_time    = arc_clean($_POST['form_chiar_and_time']         ?? '');  // typo in form, preserved
$comments      = arc_clean($_POST['form_questions_and_comments'] ?? '');

// ── Required field validation ────────────────────────────────────────────────
if (empty($name) || empty($phone) || empty($email)) {
    arc_json('false', 'Please fill in all required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    arc_json('false', 'Please enter a valid email address.');
}

// ── Build email ──────────────────────────────────────────────────────────────
$subject = 'ARC Dialysis Contact Form — ' . $name . ' — ' . date('M j, Y g:i A');

$body  = "New contact form submission from arcdialysis.com\n";
$body .= str_repeat('-', 60) . "\n\n";
$body .= "Name:             " . $name          . "\n";
$body .= "Phone:            " . $phone         . "\n";
$body .= "Email:            " . $email         . "\n";
$body .= "Location:         " . $location      . "\n";
$body .= "Chair/Time Pref:  " . $chair_time    . "\n\n";
$body .= "Questions/Comments:\n" . $comments   . "\n\n";
$body .= str_repeat('-', 60) . "\n";
$body .= "reCAPTCHA Score:  " . $recaptcha_score . "\n";
$body .= "Submitted:        " . date('Y-m-d H:i:s T') . "\n";
$body .= "IP Address:       " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers  = "From: ARC Dialysis Website <" . ARC_FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "CC: mhedden13@gmail.com\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ── Send email ───────────────────────────────────────────────────────────────
$mail_sent = mail(ARC_TO_EMAIL, $subject, $body, $headers);

if ($mail_sent) {
    arc_json('true', '<strong>Thank you, ' . $name . '!</strong> Your message has been received. A member of our team will contact you shortly.');
} else {
    error_log('ARC Dialysis quickcontact.php: mail() failed for ' . $email);
    arc_json('false', 'There was a problem sending your message. Please call us directly at <a href="tel:3054486261">(305) 448-6261</a>.');
}
?>
