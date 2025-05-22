<?php


$url =  './teams.json';
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPGET, true);

$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo 'Error:' . curl_error($ch);
} else {
  // Tampilkan response (misalnya JSON)
  echo json_decode($response);
}

// Menutup koneksi cURL
curl_close($ch);
