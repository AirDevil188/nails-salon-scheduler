export function formatAppointmentNumber(num) {
  const numString = String(num);

  const digitCount = numString.length;

  const padLength = Math.max(3, digitCount);

  const paddedNumber = numString.padStart(padLength, "0");

  return `#${paddedNumber}`;
}
