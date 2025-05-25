const { exec } = require('child_process');

/**
 * Recover the currently active keyboard layout in Windows
 * using PowerShell: (Get-WinUserLanguageList)[0].InputMethodTips
 * 
 * Output example: "0409:00000409" → return "00000409"
 * 
 * @param {(layoutId: string|null) => void} callback - callback function that riceive the ID
 */
function getCurrentKeyboardLayout(callback) {
  const psCommand = `
    $override = Get-WinDefaultInputMethodOverride;
    if ($override) {
      $override
    } else {
      (Get-WinUserLanguageList)[0].InputMethodTips | Select-Object -First 1
    }
  `.replace(/\n/g, ' ').trim();

  exec(`powershell -Command "${psCommand}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Errore PowerShell:', err);
      return callback(null);
    }

    const match = stdout.match(/:(\w{8})/);
    if (match && match[1]) {
      const layoutId = match[1].toUpperCase();
      callback(layoutId);
    } else {
      callback(null);
    }
  });
}


function getLangPrefix(layoutId) {
  return layoutId.slice(-4);
}

/**
 * Set a single keyboard layout by removing the others
 * @param {string} layoutId - layout code (example: '00000409')
 * @param {(success: boolean) => void} callback
 */
function setKeyboardLayout(layoutId, callback) {
  const langPrefix = getLangPrefix(layoutId);
  const fullInputTip = `\\"${langPrefix}:${layoutId}\\"`;

  // PowerShell command to execute
  const psCommand = `
    $LangList = Get-WinUserLanguageList;
    $NewLangList = New-WinUserLanguageList -Language $LangList[0].LanguageTag;
    $NewLangList[0].InputMethodTips.Clear();
    $NewLangList[0].InputMethodTips.Add("${fullInputTip}");
    Set-WinUserLanguageList $NewLangList -Force;
    Set-WinDefaultInputMethodOverride -InputTip "${fullInputTip}";
  `.replace(/\n/g, ' ').trim();

  exec(`powershell -Command "${psCommand}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Errore nel cambio layout:', err);
      callback(false);
    } else {
      callback(true);
    }
  });
}

module.exports = {
  getCurrentKeyboardLayout,
  setKeyboardLayout
};
