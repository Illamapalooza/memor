import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { passwordValidation } from "@/utils/validation";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  password: string;
};

export function PasswordStrengthIndicator({ password }: Props) {
  const theme = useAppTheme();
  if (!password) return null;

  const isValid = passwordValidation.isValid(password);
  const message = passwordValidation.getStrengthMessage(password);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          { color: isValid ? theme.colors.primary : theme.colors.error },
        ]}
      >
        {message || "Password is valid"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -12,
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
  },
});
