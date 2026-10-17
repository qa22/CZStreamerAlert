export default function parseABAMessage(text) {
  if (!text || typeof text !== 'string') return null;

  // Match USD like "$0.10" or "$10"
  // Allow numbers with optional commas (e.g. 1,000)
  const usdMatch = text.match(/\$\s*([0-9\,]+(?:\.[0-9]+)?)/);
  const khrMatch = text.match(/៛\s*([0-9\,]+(?:\.[0-9]+)?)/);
  // Capture name after "paid by" up until common separators like " on ", " via ", " at ", comma or line end
  const byMatch = text.match(/paid by\s+(.+?)(?:\s+on\s+|\s+via\s+|\s+at\s+|,|$)/i);
  const remarkMatch = text.match(/Remark:\s*(.+)/i);

  let currency = null;
  let amount = null;

  if (usdMatch) {
    currency = 'USD';
    amount = parseFloat(usdMatch[1].replace(/,/g, ''));
  } else if (khrMatch) {
    currency = 'KHR';
    amount = parseFloat(khrMatch[1].replace(/,/g, ''));
  }

  if (amount == null || Number.isNaN(amount)) return null;

  const name = byMatch ? byMatch[1].trim() : 'Anonymous';
  const message = remarkMatch ? remarkMatch[1].trim() : 'Thanks for your support ❤️';

  return {
    name,
    amount,
    currency,
    message
  };
}
