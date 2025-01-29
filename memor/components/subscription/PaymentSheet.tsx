import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useStripe } from "@stripe/stripe-react-native";
import { PrimaryButton } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { subscriptionService } from "@/services/subscription/subscription.service";

type PaymentSheetProps = {
  plan: "monthly" | "yearly";
  onSuccess: () => void;
  onCancel: () => void;
};

export const PaymentSheet = ({
  plan,
  onSuccess,
  onCancel,
}: PaymentSheetProps) => {
  const { createPaymentMethod } = useStripe();
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create a payment method
      const { paymentMethod, error: paymentMethodError } =
        await createPaymentMethod({
          paymentMethodType: "Card",
        });

      if (paymentMethodError) {
        Alert.alert("Error", paymentMethodError.message);
        return;
      }

      if (!paymentMethod) {
        Alert.alert("Error", "Failed to create payment method");
        return;
      }

      // Create subscription with the payment method
      await subscriptionService.createSubscription(plan, paymentMethod.id);

      // Payment successful
      onSuccess();
    } catch (error: any) {
      console.error("Error processing payment:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to process payment. Please try again."
      );
      if (error.code === "Canceled") {
        onCancel();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Add Payment Method
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        You'll be charged {plan === "monthly" ? "$9.99/month" : "$99.99/year"}{" "}
        after your free trial ends.
      </Text>
      <PrimaryButton
        onPress={handlePayment}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Add Payment Method
      </PrimaryButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
  },
});
