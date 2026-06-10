/**
 * leakDisplay.js
 * ──────────────
 * Centralised leak-status display resolver.
 *
 * No-leak state (prediction === 'No Leak' | 'Healthy' | falsy):
 *   leakLabel      → 'NO LEAK'            (green, bold)
 *   leakStatus     → 'No Leak Detected'
 *   riskDisplay    → '—'                  (neutral grey)
 *   sectionDisplay → '—'                  (neutral grey)
 *   isNil          → true
 *
 * Leak state:
 *   leakLabel      → raw prediction string (e.g. 'Intake Leak')
 *   leakStatus     → same as leakLabel
 *   riskDisplay    → raw riskLevel string  (existing colour logic applies)
 *   sectionDisplay → derived section string
 *   isNil          → false
 *
 * Import this in every place that renders leak-related values so the
 * logic stays consistent across Results, Report, PDF, and any future views.
 */

/**
 * @param {string} prediction  – raw ML classification string
 * @param {string} [riskLevel] – raw risk level string (optional, used for leak state)
 * @returns {{
 *   leakLabel:      string,
 *   leakStatus:     string,
 *   riskDisplay:    string,
 *   sectionDisplay: string,
 *   isNil:          boolean
 * }}
 */
export function getLeakDisplay(prediction, riskLevel = '') {
  const isNil = !prediction || prediction === 'No Leak' || prediction === 'Healthy';

  if (isNil) {
    return {
      leakLabel:      'NO LEAK',
      leakStatus:     'No Leak Detected',
      riskDisplay:    '—',
      sectionDisplay: '—',
      isNil:          true,
    };
  }

  // Derive detected section label from the prediction string
  const sectionDisplay =
    prediction.includes('Intake') && prediction.includes('Exhaust') ? 'Intake + Exhaust' :
    prediction.includes('Intake')  ? 'Intake System'  :
    prediction.includes('Exhaust') ? 'Exhaust System' :
    prediction;

  return {
    leakLabel:      prediction,
    leakStatus:     prediction,
    riskDisplay:    riskLevel || prediction,
    sectionDisplay,
    isNil:          false,
  };
}
