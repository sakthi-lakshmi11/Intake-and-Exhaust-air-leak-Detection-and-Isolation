/**
 * leakPath.js — canonical leak-section → path-type mapping.
 */

/**
 * @param {string} leakLocation
 * @returns {string}
 */
export function getDetectedPath(leakLocation) {
  const intakeCodes = ['CS1', 'CS2', 'CS3', 'CS4'];
  const exhaustCodes = ['HS1', 'DOC', 'DPF', 'SCR'];

  const code = leakLocation?.split(':')[0]?.trim();

  // Existing code‑prefix handling
  if (intakeCodes.includes(code)) {
    return 'Intake Path';
  }
  if (exhaustCodes.includes(code)) {
    return 'Exhaust Path';
  }

  // Fallback: match full component description (case‑insensitive)
  const lower = String(leakLocation || '').toLowerCase();
  const intakePatterns = [
    'air filter to maf sensor',
    'maf sensor to turbocharger compressor inlet',
    'compressor outlet to charge air cooler',
    'charge air cooler (cac) to intake manifold',
    // also allow without the "CSx:" prefix but same text
  ];
  const exhaustPatterns = [
    'cylinder to turbocharger turbine inlet',
    'diesel oxidation catalyst',
    'diesel particulate filter',
    'selective catalytic reduction',
  ];

  if (intakePatterns.some(p => lower.includes(p))) {
    return 'Intake Path';
  }
  if (exhaustPatterns.some(p => lower.includes(p))) {
    return 'Exhaust Path';
  }

  // Previous fallback for mock data / other cases
  if (lower.includes('intake')) {
    return 'Intake Path';
  }
  if (lower.includes('exhaust')) {
    return 'Exhaust Path';
  }
  return 'UNKNOWN';
}
