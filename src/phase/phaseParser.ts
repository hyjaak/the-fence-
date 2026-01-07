import path from 'path';

export function parsePhaseMarkdown(
  fullPath: string,
  content: string
): { phaseId: number; title: string } {
  // Enforce END OF FILE
  if (!content.includes('END OF FILE')) {
    throw new Error(`Missing END OF FILE in ${fullPath}`);
  }

  // Extract phaseId from filename
  const filename = path.basename(fullPath);
  const phaseIdMatch = filename.match(/THEFENCE_PHASE(\d+)_/);
  if (!phaseIdMatch) {
    throw new Error(`Invalid phase filename format: ${filename}`);
  }
  const phaseId = parseInt(phaseIdMatch[1], 10);

  // Extract title from first H1
  const lines = content.split('\n');
  let title = filename.replace(/\.md$/, '');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      title = trimmed.substring(2).trim();
      break;
    }
  }

  return { phaseId, title };
}
