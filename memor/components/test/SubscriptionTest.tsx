import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text } from "react-native-paper";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionService } from "@/services/subscription/subscription.service";
import { CardField, useStripe } from "@stripe/stripe-react-native";

export const SubscriptionTest = () => {
  const { subscription, isLoading } = useSubscription();
  const { createPaymentMethod } = useStripe();
  const [cardComplete, setCardComplete] = React.useState(false);
  const [testingInProgress, setTestingInProgress] = React.useState(false);

  const handleTestSubscription = async () => {
    try {
      setTestingInProgress(true);
      console.log("Starting subscription test...");

      // Create a test payment method
      console.log("Creating payment method...");
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (error) {
        console.error("Error creating payment method:", error);
        Alert.alert(
          "Error",
          `Failed to create payment method: ${error.message}`
        );
        return;
      }

      if (!paymentMethod) {
        console.error("No payment method created");
        Alert.alert("Error", "No payment method created");
        return;
      }

      console.log("Payment method created:", paymentMethod.id);

      // Create subscription
      console.log("Creating subscription...");
      await subscriptionService.createSubscription("monthly", paymentMethod.id);
      console.log("Subscription created successfully");
      Alert.alert("Success", "Subscription created successfully!");
    } catch (error: any) {
      console.error("Error in test subscription:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred during subscription creation"
      );
    } finally {
      setTestingInProgress(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setTestingInProgress(true);
      console.log("Cancelling subscription...");
      await subscriptionService.cancelSubscription();
      console.log("Subscription cancelled successfully");
      Alert.alert("Success", "Subscription cancelled successfully!");
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while cancelling subscription"
      );
    } finally {
      setTestingInProgress(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Subscription Test Panel
      </Text>

      <Text>Status: {subscription?.status || "none"}</Text>
      {subscription?.trialEnd && (
        <Text>
          Trial ends:{" "}
          {new Date(subscription.trialEnd * 1000).toLocaleDateString()}
        </Text>
      )}

      <CardField
        postalCodeEnabled={false}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
        }}
        style={styles.cardField}
      />

      <Button
        mode="contained"
        onPress={handleTestSubscription}
        disabled={!cardComplete || isLoading || testingInProgress}
        loading={testingInProgress}
      >
        Test Subscribe
      </Button>

      {subscription && (
        <Button
          mode="outlined"
          onPress={handleCancelSubscription}
          style={styles.cancelButton}
          disabled={testingInProgress}
          loading={testingInProgress}
        >
          Cancel Subscription
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    marginTop: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  cardField: {
    height: 50,
    marginVertical: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});
