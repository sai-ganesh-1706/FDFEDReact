export const PHONE_MESSAGE =
  "Phone number must contain exactly 10 digits, with no spaces or special characters.";
export const phoneError = (value, required = false) =>
  !value && !required
    ? ""
    : /^[0-9]{10}$/.test(String(value ?? ""))
      ? ""
      : PHONE_MESSAGE;
export const phoneInputProps = {
  inputMode: "numeric",
  maxLength: 10,
  pattern: "[0-9]{10}",
  title: PHONE_MESSAGE,
};
