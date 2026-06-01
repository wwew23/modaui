<?php
// Usage: php scripts/set_openai_key.php VAR_NAME VALUE
if ($argc < 3) {
    echo "Usage: php scripts/set_openai_key.php VAR_NAME VALUE\n";
    exit(1);
}
$varName = strtoupper($argv[1]);
$value = $argv[2];
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    echo ".env file not found at project root. Create one first.\n";
    exit(1);
}
$contents = file_get_contents($envFile);
$pattern = '/^' . preg_quote($varName, '/') . '=.*/m';
$replacement = $varName . '=' . $value;
if (preg_match($pattern, $contents)) {
    $contents = preg_replace($pattern, $replacement, $contents);
} else {
    $contents .= PHP_EOL . $replacement . PHP_EOL;
}
file_put_contents($envFile, $contents);
echo "Set {$varName} in .env (do not commit .env to VCS).\n";
