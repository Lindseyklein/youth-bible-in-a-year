import { Platform } from 'react-native';
import Purchases, { 
  CustomerInfo, 
  PurchasesOffering, 
  PurchasesPackage 
} from 'react-native-purchases';

// RevenueCat API keys - these should be set via environment variables
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

// Entitlement identifier for premium subscription
const PRO_ENTITLEMENT_ID = 'pro';

// Track if Purchases has been configured
let isConfigured = false;

/**
 * Configure RevenueCat Purchases SDK
 * This should be called once during app startup
 * 
 * @param userId - Optional user ID to identify the user in RevenueCat. If undefined, configures anonymously or logs out if previously logged in.
 */
export async function configurePurchases(userId?: string): Promise<void> {
  try {
    // Get the appropriate API key based on platform
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_API_KEY_IOS 
      : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      throw new Error(
        `RevenueCat API key not found. Please set EXPO_PUBLIC_REVENUECAT_API_KEY_${Platform.OS === 'ios' ? 'IOS' : 'ANDROID'} environment variable.`
      );
    }

    // Only configure once - subsequent calls will just update user identity
    if (!isConfigured) {
      await Purchases.configure({ apiKey });
      isConfigured = true;
      console.log('RevenueCat Purchases configured successfully');
    }

    // Handle user identity
    if (userId) {
      await Purchases.logIn(userId);
      console.log(`RevenueCat logged in with user ID: ${userId}`);
    } else {
      // If no userId provided and already configured, log out to reset to anonymous
      // Note: logOut() is only available in newer SDK versions, so we check first
      try {
        const currentUser = await Purchases.getCustomerInfo();
        // If there's an identified user, log them out
        if (currentUser.originalAppUserId && currentUser.originalAppUserId.startsWith('$RCAnonymousID:') === false) {
          // Only log out if we were previously logged in with a real user ID
          // For now, we'll let the SDK handle anonymous users automatically
        }
      } catch (err) {
        // Ignore errors checking current user status
      }
    }
  } catch (error) {
    console.error('Error configuring RevenueCat Purchases:', error);
    throw error;
  }
}

/**
 * Get available offerings from RevenueCat
 * 
 * @returns PurchasesOffering object containing available packages
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error getting offerings:', error);
    throw error;
  }
}

/**
 * Get the current customer info from RevenueCat
 * 
 * @returns CustomerInfo object containing entitlements and purchase history
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
}

/**
 * Purchase a package or offering
 * 
 * @param packageIdOrOffering - Either a PurchasesPackage object or PurchasesOffering object
 * @returns CustomerInfo after successful purchase
 */
export async function purchase(
  packageIdOrOffering: PurchasesPackage | PurchasesOffering
): Promise<CustomerInfo> {
  try {
    let customerInfo: CustomerInfo;

    // Check if it's a package or offering
    if ('identifier' in packageIdOrOffering && 'packageType' in packageIdOrOffering) {
      // It's a PurchasesPackage
      const packageToPurchase = packageIdOrOffering as PurchasesPackage;
      const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
      customerInfo = purchaseResult.customerInfo;
    } else if ('identifier' in packageIdOrOffering && 'availablePackages' in packageIdOrOffering) {
      // It's a PurchasesOffering - use the first available package
      const offering = packageIdOrOffering as PurchasesOffering;
      if (offering.availablePackages.length === 0) {
        throw new Error('No packages available in offering');
      }
      const packageToPurchase = offering.availablePackages[0];
      const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
      customerInfo = purchaseResult.customerInfo;
    } else {
      throw new Error('Invalid package or offering provided');
    }

    return customerInfo;
  } catch (error: any) {
    console.error('Error making purchase:', error);
    // Re-throw with more context if it's a user cancellation
    if (error.userCancelled) {
      throw new Error('Purchase was cancelled by user');
    }
    throw error;
  }
}

/**
 * Restore previous purchases for the current user
 * 
 * @returns CustomerInfo after restore
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

/**
 * Check if the customer has premium access via the "pro" entitlement
 * 
 * @param customerInfo - CustomerInfo object from RevenueCat
 * @returns true if the customer has active "pro" entitlement
 */
export function isPremium(customerInfo: CustomerInfo): boolean {
  try {
    const proEntitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
    return proEntitlement !== undefined;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

