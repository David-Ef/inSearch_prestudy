<?php
session_start();

if (array_key_exists("hash", $_SESSION)) {

	$subjUUI = explode("_", $_POST['filename'])[1];
	$subjid = explode("_", $_POST['filename'])[2];

	// Confirm that this subject finished the experiment
	$fp = fopen("./count_subj/prog_" . $subjid . "_" . $subjUUI, "a");
	fwrite($fp, $_POST['tag'] . "\n");
	fclose();
}

?>
