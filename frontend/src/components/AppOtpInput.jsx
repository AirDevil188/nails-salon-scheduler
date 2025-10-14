import {
  TextInputOTP,
  TextInputOTPSlot,
  TextInputOTPGroup,
  TextInputOTPSeparator,
} from "react-native-input-code-otp";

export default function AppOtpInput({
  length,
  onFilled,
  slotTextStyles,
  slotStyles,
  focusedSlotStyles,
  focusedSlotTextStyles,
  ...otherProps
}) {
  return (
    <TextInputOTP
      maxLength={length}
      onFilled={onFilled}
      {...otherProps}
      containerStyles={{ flex: 1 }}
    >
      <TextInputOTPGroup groupStyles={{ gap: 10 }}>
        <TextInputOTPSlot
          index={0}
          slotTextStyles={slotTextStyles}
          slotStyles={slotStyles}
          focusedSlotStyles={focusedSlotStyles}
          focusedSlotTextStyles={focusedSlotTextStyles}
        />
        <TextInputOTPSlot
          index={1}
          slotTextStyles={slotTextStyles}
          slotStyles={slotStyles}
          focusedSlotStyles={focusedSlotStyles}
          focusedSlotTextStyles={focusedSlotTextStyles}
        />
        <TextInputOTPSlot
          index={2}
          slotTextStyles={slotTextStyles}
          slotStyles={slotStyles}
          focusedSlotStyles={focusedSlotStyles}
          focusedSlotTextStyles={focusedSlotTextStyles}
        />
      </TextInputOTPGroup>
      <TextInputOTPSeparator />
      <TextInputOTPGroup groupStyles={{ gap: 10 }}>
        <TextInputOTPSlot
          index={3}
          slotTextStyles={slotTextStyles}
          slotStyles={slotStyles}
          focusedSlotStyles={focusedSlotStyles}
          focusedSlotTextStyles={focusedSlotTextStyles}
        />
        <TextInputOTPSlot
          index={4}
          slotTextStyles={slotTextStyles}
          slotStyles={slotStyles}
          focusedSlotStyles={focusedSlotStyles}
          focusedSlotTextStyles={focusedSlotTextStyles}
        />
        <TextInputOTPSlot
          index={5}
          slotTextStyles={slotTextStyles}
          slotStyles={slotStyles}
          focusedSlotStyles={focusedSlotStyles}
          focusedSlotTextStyles={focusedSlotTextStyles}
        />
      </TextInputOTPGroup>
    </TextInputOTP>
  );
}
