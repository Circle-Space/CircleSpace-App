# 🔐 Agora App Certificate Setup Guide

## 📋 **Step-by-Step Instructions**

### **1. Get Your App Certificate**

1. **Go to Agora Console**: https://console.agora.io/
2. **Select your project**: `e25fad37055049a4bf1a63a95a7cb697`
3. **Click "Config"** in the left sidebar
4. **Find "App Certificate"** section
5. **Copy the certificate** (it's a long string of characters)

### **2. Update Configuration**

Open `src/config/agora.config.ts` and replace:

```typescript
appCertificate: 'YOUR_APP_CERTIFICATE_HERE',
```

With your actual certificate:

```typescript
appCertificate: 'your-actual-certificate-string-here',
```

### **3. How It Works**

- **With App Certificate**: Generates secure tokens automatically
- **Without App Certificate**: Uses insecure mode (empty token)
- **Tokens expire**: After 1 hour (configurable)

## 🔧 **Current Setup**

Your current configuration:
- ✅ **App ID**: `e25fad37055049a4bf1a63a95a7cb697`
- ❌ **App Certificate**: Not configured
- 🔓 **Mode**: Insecure (working, but not secure)

## 🎯 **Benefits of App Certificate**

1. **Secure**: Tokens are cryptographically signed
2. **Automatic**: No need to manually generate tokens
3. **Production Ready**: Suitable for real apps
4. **Expiration**: Tokens expire automatically for security

## 🚀 **Testing**

1. **Add your App Certificate** to the config
2. **Restart the app**
3. **Try video call** - it will generate secure tokens automatically

## 📝 **Example App Certificate**

App Certificates look like this:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## ⚠️ **Security Notes**

- **Never commit** App Certificate to public repositories
- **Use environment variables** in production
- **Rotate certificates** periodically
- **Keep certificates secret**

## 🔍 **Debugging**

Check console logs for:
- `🔐 App Certificate detected, generating secure token...`
- `✅ Secure token generated successfully`
- `🔐 Using App Certificate: Yes`

## 📞 **Support**

If you need help:
1. Check Agora documentation
2. Verify App Certificate format
3. Ensure project settings match 