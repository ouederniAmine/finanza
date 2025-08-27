---
title: Clerk Expo SDK
description: The Clerk Expo SDK gives you access to prebuilt components, React
  hooks, and helpers to make user authentication easier.
lastUpdated: 2025-07-23T17:20:31.000Z
---

The Clerk Expo SDK gives you access to prebuilt components, React hooks, and helpers to make user authentication easier. Refer to the <SDKLink href="/docs/quickstarts/expo" sdks={["expo"]}>quickstart guide</SDKLink> to get started.

## Available resources

The Expo SDK gives you access to the following resources:

### Hooks

The Expo SDK provides the following hooks:

* <SDKLink href="/docs/references/expo/use-sso" sdks={["expo"]} code={true}>useSSO()</SDKLink>
* <SDKLink href="/docs/references/expo/use-local-credentials" sdks={["expo"]} code={true}>useLocalCredentials()</SDKLink>

Because the Expo SDK is built on top of the Clerk React SDK, you can use the hooks that the React SDK provides. These hooks include access to the <SDKLink href="/docs/references/javascript/clerk" sdks={["js-frontend"]} code={true}>Clerk</SDKLink> object, <SDKLink href="/docs/references/javascript/user" sdks={["js-frontend"]} code={true}>User object</SDKLink>, <SDKLink href="/docs/references/javascript/organization" sdks={["js-frontend"]} code={true}>Organization object</SDKLink>, and a set of useful helper methods for signing in and signing up.

* <SDKLink href="/docs/:sdk:/hooks/use-user" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useUser()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-clerk" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useClerk()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-auth" sdks={["astro","chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useAuth()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-sign-in" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useSignIn()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-sign-up" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useSignUp()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-session" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useSession()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-session-list" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useSessionList()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-organization" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useOrganization()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-organization-list" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useOrganizationList()</SDKLink>
* <SDKLink href="/docs/:sdk:/hooks/use-reverification" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useReverification()</SDKLink>

### Components

* **Native** apps:
  * <SDKLink href="/docs/:sdk:/components/control/clerk-loaded" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<ClerkLoaded></SDKLink>
  * <SDKLink href="/docs/:sdk:/components/control/clerk-loading" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<ClerkLoading></SDKLink>
  * <SDKLink href="/docs/:sdk:/components/control/signed-in" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<SignedIn></SDKLink>
  * <SDKLink href="/docs/:sdk:/components/control/signed-out" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<SignedOut></SDKLink>
  * <SDKLink href="/docs/:sdk:/components/protect" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<Protect></SDKLink>
  * For other components, see the <SDKLink href="/docs/references/expo/overview#custom-flows" sdks={["expo"]}>custom flows</SDKLink> section for more information.
* **Web** apps:
  * All Clerk components are available. See [the component docs](/docs/components/overview) for more information.

## Custom flows

<If sdk="expo">
  > \[!WARNING]
  > Expo does not support email links. You can request this feature on [Clerk's roadmap](https://feedback.clerk.com/).
</If>

For **native** applications, Clerk's prebuilt components are not supported. You must use the Clerk API to build custom UI's for flows such as signing in and signing up. See the [custom flow](/docs/custom-flows/overview) guides for more information.

For **web** applications, if Clerk's [prebuilt components](/docs/components/overview) don't meet your specific needs or if you require more control over the logic, you can rebuild the existing Clerk flows using the Clerk API. See the [custom flow](/docs/custom-flows/overview) guides for more information.

## Deploy your app

To learn how to deploy your Expo application, see the [dedicated guide](/docs/deployments/deploy-expo).
---
title: Read session and user data with Expo
description: Learn how to read session & user data in Expo with Clerk.
lastUpdated: 2025-07-23T17:20:31.000Z
---

This guide demonstrates how to access active session and user data in your Expo application.

## Session data example

{/* TODO: Keep in sync with _partials/hooks/use-auth */}

The <SDKLink href="/docs/:sdk:/hooks/use-auth" sdks={["astro","chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useAuth()</SDKLink>{{ target: '_blank' }} hook provides information about the current auth state, as well as helper methods to manage the current active session.

```tsx {{ filename: 'components/UseAuthExample.tsx' }}
import { useAuth } from '@clerk/clerk-expo'
import { Text, View, TouchableOpacity } from 'react-native'

export default function UseAuthExample() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()

  const fetchExternalData = async () => {
    // Use `getToken()` to get the current user's session token
    const token = await getToken()

    // Use `token` to fetch data from an external API
    const response = await fetch('https://api.example.com/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.json()
  }

  // Use `isLoaded` to check if Clerk is loaded
  if (!isLoaded) {
    return <Text>Loading...</Text>
  }

  // Use `isSignedIn` to check if the user is signed in
  if (!isSignedIn) {
    // You could also add a redirect to the sign-in page here
    return <Text>Sign in to view this page</Text>
  }

  return (
    <View>
      <Text>
        Hello, {userId}! Your current active session is {sessionId}.
      </Text>
      <TouchableOpacity onPress={fetchExternalData}>
        <Text>Fetch Data</Text>
      </TouchableOpacity>
    </View>
  )
}
```

## User data example

{/* TODO: Keep in sync with _partials/hooks/use-user */}

The <SDKLink href="/docs/:sdk:/hooks/use-user" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>useUser()</SDKLink>{{ target: '_blank' }} hook enables you to access the <SDKLink href="/docs/references/javascript/user" sdks={["js-frontend"]} code={true}>User</SDKLink> object, which contains the current user's data such as their full name.

The following example demonstrates how to use `useUser()` to check if the user is signed in and display their first name:

```tsx {{ filename: 'src/Example.tsx' }}
import { useUser } from '@clerk/clerk-expo'
import { Text } from 'react-native'

export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return <Text>Loading...</Text>
  }

  if (!isSignedIn) {
    return <Text>Sign in to view this page</Text>
  }

  return <Text>Hello {user.firstName}!</Text>
}
```
---
title: Sign-up and sign-in options
description: Clerk provides various options for configuring a sign-up and sign-in flow.
lastUpdated: 2025-07-23T20:37:01.000Z
---

Clerk provides multiple options for configuring a sign-up and sign-in flow for your application, such as [identifiers](#identifiers) and [sign-in options](#sign-in-options). This guide will walk you through each option.

You can modify your authentication options after your application has been created by navigating to the [Clerk Dashboard](https://dashboard.clerk.com/) and selecting any of the options under **User & Authentication** in the left sidenav.

## User profile & sign-up

### Identifiers

Identifiers are how your application recognizes an individual user. The following identifiers are available:

* **Email address**
* **Phone number**
  * SMS authentication requires a [paid plan](/pricing){{ target: '_blank' }} for production use, but all features are free to use in development mode so that you can try out what works for you. See the [pricing](/pricing){{ target: '_blank' }} page for more information.
  * SMS functionality is restricted to phone numbers from countries enabled on your [SMS allowlist](#sms-allowlist).
* **Username**
  > \[!IMPORTANT]
  > Usernames only support Latin-based characters. This restriction helps protect against Unicode spoofing and homograph attacks, where characters from non-Latin scripts can be used to impersonate users.
* **First and last name**

For more information on configuring identifiers, navigate to the [**Email, phone, username**](https://dashboard.clerk.com/last-active?path=user-authentication/email-phone-username) page in the Clerk Dashboard.

## Sign-in options

To configure the options available to users for signing in, navigate to the [**Email, phone, username**](https://dashboard.clerk.com/last-active?path=user-authentication/email-phone-username) page in the Clerk Dashboard and select the **Sign-in options** tab.

The easiest way to allow your users to create and manage their sign-in options is to use the prebuilt <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserProfile></SDKLink> component. If you're building a custom user interface using the Clerk API, refer to the [custom flow guides](/docs/custom-flows/overview).

The following sign-in options are available:

### Email verification code

When **Email verification code** is enabled, users receive a one-time code to their email address to sign in.

### Email verification link

<If sdk="expo">
  > \[!WARNING]
  > Expo does not support email links. You can request this feature on [Clerk's roadmap](https://feedback.clerk.com/).
</If>

When **Email verification link** is enabled, users receive an email with a link to sign in.

As a security measure, email links expire after 10 minutes to prevent the use of compromised or stale links.

#### Require the same device and browser

By default, the **Require the same device and browser** setting is enabled. This means that email links are required to be verified from the same device and browser on which the sign-up or sign-in was initiated. For example:

* A user tries to sign in from their desktop browser.
* They open the email link on their mobile phone to verify their email address.
* The user's sign-in on the desktop browser **gets an error**, because the link was verified on a different device and browser.

### Phone number (SMS verification code)

When **Phone number (SMS verification code)** is enabled, users receive a one-time code to their phone number to sign in.

SMS authentication requires a [paid plan](/pricing){{ target: '_blank' }} for production use, but all features are free to use in development mode so that you can try out what works for you. See the [pricing](/pricing){{ target: '_blank' }} page for more information.

SMS functionality is restricted to phone numbers from countries enabled on your [SMS allowlist](#sms-allowlist).

### SMS allowlist

SMS functionality, including SMS OTPs, is restricted to phone numbers from countries that are enabled on your SMS allowlist. This can be useful for avoiding extraneous SMS fees from countries from which your app is not expected to attract traffic.

Every instance starts off with a default set of enabled SMS country tiers. To tailor it to your needs:

1. In the Clerk Dashboard, navigate to the [**SMS**](https://dashboard.clerk.com/last-active?path=customization/sms) page.
2. Select the **Settings** tab.
3. Enable or disable countries as needed.

If a country is disabled, then phone numbers starting with the corresponding country calling code:

* Cannot receive OTPs and a request to receive an OTP will be rejected with an error
* Cannot receive notifications for password or passkey modifications
* Cannot be used upon sign-up
* Cannot be added to an existing user profile

### Password

When **Password** is enabled, users provide a password to sign in.

Disabling **Password** will only affect new users. Existing users will still be able to sign in with their existing password.

### Passkeys

A passkey is a type of sign-in credential that requires one user action, but uses two authentication factors:

1. A pin number or biometric data
2. A physical device

**Users can only create passkeys after signing up**, so you'll need to enable another authentication strategy for the sign-up process. After signing in, users can create a passkey.

#### Passkey limitations

* Passkeys are not currently available as an [MFA](#multi-factor-authentication) option.
* Not all devices and browsers are compatible with passkeys. Passkeys are built on WebAuthn technology and you should check [the Browser Compatibility docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#browser_compatibility) for an up-to-date list.
* Passkey related APIs will not work with Expo.
* Your users can have a max of 10 passkeys per account.

#### Domain restrictions for passkeys

Passkeys are tied to the domain they are created on and **cannot be used across different domains**. However, passkeys **do work on subdomains** if they are registered on the root domain. For example:

* Passkeys created on `your-domain.com` **cannot be used** on `your-domain-admin.com` (different domains).
* Passkeys created on `your-domain.com` **can be used** on `accounts.your-domain.com` (subdomain of the same root domain).
* Passkeys created on `staging1.your-domain.com` **cannot be used** on `staging2.your-domain.com` (sibling subdomains) unless the passkey was scoped to `your-domain.com` (i.e. the shared root domain).

**If you're using [satellite domains](/docs/advanced-usage/satellite-domains)**, in both development and production, passkeys won't be portable between your primary domain and your satellite domains so you should avoid using them.

If you're **not** using satellite domains:

* **In development**, you can either:

  * **The recommended approach**. Use Clerk's [components](/docs/components/overview), [Elements](/docs/customization/elements/overview), or [custom flows](/docs/custom-flows/overview), instead of the [Account Portal](/docs/account-portal/overview). This ensures the passkey is created and used entirely on your development domain, so passkeys created on `localhost` will only work on `localhost`.
  * Create a passkey directly through the Account Portal instead of your local application to keep it tied to the Account Portal's domain. Passkeys created on your Account Portal (e.g., `your-app.accounts.dev`) will only work on that domain, which can cause issues if you switch between `localhost` and the Account Portal during development. If you choose this approach, ensure all testing happens on the same domain where the passkey was created.

* **In production,** your Account Portal is usually hosted on a subdomain of your main domain (e.g. `accounts.your-domain.com`), enabling passkeys to work seamlessly across your app. However, as stated above, if you use **satellite domains**, passkeys will not work as intended.

## Social connections (OAuth)

Clerk offers several [social providers](/docs/authentication/social-connections/oauth) for use during sign-up and sign-in. This authentication option is appealing because users often don't need to enter additional contact information since the provider already has it.

Clerk's OAuth process is designed to be seamless. If an existing user attempts to sign up with a social provider, the system automatically switches to sign-in. Similarly, if a user tries to sign in with a social provider but doesn't have an account, Clerk will automatically create one.

Users can link multiple social providers to their account, depending on your application's setup. You can configure your application to use the [Account Portal User Profile page](/docs/account-portal/overview#user-profile), the prebuilt <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserProfile /></SDKLink> component, or [build your own custom user interface using the Clerk API.](/docs/custom-flows/oauth-connections).

To enable social connections:

1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
2. Select the **Add connection** button, and select **For all users**.
3. For development instances, simply select the social providers that you would like to enable. For production instances, you'll need to configure credentials for each social provider. See [the social provider's dedicated guide](/docs/authentication/social-connections/oauth) to learn how to configure credentials.

## Web3 authentication

Clerk provides Web3 authentication with either [MetaMask](/docs/authentication/web3/metamask), [Coinbase Wallet](/docs/authentication/web3/coinbase-wallet), or [OKX Wallet](/docs/authentication/web3/okx-wallet). As part of validating the accuracy of the returned Web3 account address, Clerk handles the signing of a message and verifying the signature. Because sign-in with Web3 uses the same abstraction as our other authentication factors, like passwords or email links, other Clerk features like multi-factor authentication and profile enrichment work for Web3 users out-of-the-box.

To enable Web3 authentication:

1. In the Clerk Dashboard, navigate to the [**Web3**](https://dashboard.clerk.com/last-active?path=user-authentication/web3) page.
2. Enable your preferred Web3 provider.

## Multi-factor authentication

Clerk supports multi-factor authentication (MFA), also known as two-factor authentication (2FA). If a user enables MFA for their account, they are required to complete a second verification step during sign-in. This enhances security by enforcing two different types of verification. Many websites offer this as an optional step, giving users control over their own security.

MFA is not available on the new application screen, but it can be enabled in the Clerk Dashboard.

1. In the Clerk Dashboard, navigate to the [**Multi-factor**](https://dashboard.clerk.com/last-active?path=user-authentication/multi-factor) page.
2. Toggle on the MFA strategies you would like to enable.

The following MFA strategies are currently available:

* **SMS verification code**
* **Authenticator application (also known as TOTP - Time-based One-time Password)**
* **Backup codes**

Enabling MFA allows users of your app to turn it on for their own accounts through their [User Profile](/docs/account-portal/overview#user-profile) page. Enabling MFA does not automatically turn on MFA for all users.

If you're building a custom user interface instead of using the [Account Portal](/docs/account-portal/overview) or [prebuilt components](/docs/components/overview), you can use [elements](/docs/customization/elements/examples/sign-in#multi-factor-authentication-mfa) or [the Clerk API](/docs/custom-flows/email-password-mfa) to build a custom sign-in flow that allows users to sign in with MFA.

### Reset a user's MFA

You can reset a user's MFA by deleting their MFA enrollments. This will remove all of their MFA methods and they will have to enroll in MFA again.

To reset a user's MFA:

1. At the top of the [Clerk Dashboard](https://dashboard.clerk.com/), select **Users**.
2. Select the user from the list.
3. Select the **Reset MFA enrollments** button.

## Restrictions

Clerk provides a set of restriction options designed to provide you with enhanced control over who can gain access to your application. Restrictions can limit sign-ups or prevent accounts with specific identifiers, such as email addresses, phone numbers, and even entire domains, from accessing your application. [Learn more about restrictions](/docs/authentication/configuration/restrictions).
---
title: Session options
description: Clerk provides session management options for fine-tuning user
  visits to your application.
lastUpdated: 2025-07-23T20:37:01.000Z
---

Clerk provides session management options for fine-tuning user visits to your application, including options for session lifetime, multi-session handling, and session token customization.

## Session lifetime

Depending on the business domain of an application, there might be different requirements for how long users should remain signed in. Criteria to base this decision upon typically revolve around user activity on the application and how long it has been since the user first signed in.

Ultimately, picking the ideal session lifetime is a trade-off between security and user experience. Longer sessions are generally better for UX but worse for security; and vice-versa.

Fortunately, with Clerk, you have the ability to fully control the lifetime of your users' sessions. There are two settings for doing so and you can set them via your instance settings in the [Clerk Dashboard](https://dashboard.clerk.com/): Inactivity timeout and Maximum lifetime.

> \[!NOTE]
> Note that either one or both must be enabled at all times. For security reasons, you are not allowed to disable both settings.

### Inactivity timeout

> \[!WARNING]
> This feature requires a [paid plan](/pricing){{ target: '_blank' }} for production use, but all features are free to use in development mode so that you can try out what works for you. See the [pricing](/pricing){{ target: '_blank' }} page for more information.

Inactivity timeout is the duration after which a session will expire and the user will have to sign in again, if they haven't been active on your site.

A user is considered inactive when the application is closed, or when the app stops refreshing the token.

By default, this setting is disabled. You can enable it and configure a custom inactivity timeout by following these steps:

1. In the Clerk Dashboard, navigate to the [**Sessions**](https://dashboard.clerk.com/last-active?path=sessions) page.
2. Toggle on **Inactivity timeout**.
3. Set your desired duration.

> \[!NOTE]
> You should be aware of [browser limitations](#browser-limitations-on-cookies), which may cause users to be signed out before the configured inactivity timeout.

### Maximum lifetime

Maximum lifetime is the duration after which a session will expire and the user will have to sign in again, regardless of their activity on your site.

By default, this setting is enabled with a default value of 7 days for all newly created instances. Setting a custom maximum lifetime requires a [paid plan](/pricing){{ target: '_blank' }} for production use, but it's available in development mode so that you can try out what works for you. To find this setting and change the value:

1. In the Clerk Dashboard, navigate to the [**Sessions**](https://dashboard.clerk.com/last-active?path=sessions) page.
2. Toggle on **Maximum lifetime**.
3. Set your desired duration.

> \[!NOTE]
> You should be aware of [browser limitations](#browser-limitations-on-cookies), which may cause users to be signed out before the configured maximum lifetime.

## Browser limitations on cookies

Regardless of how [session lifetimes](#session-lifetime) are configured, there are certain browser limitations & behaviors which may clear Clerk's session cookie. This will cause users to be signed out, even if your session lifetimes are set to a longer duration. As a result, it is impossible to achieve a setup where your users are never signed out.

### User behaviors

In the event that a user manually clears their cookies, Clerk's session cookie will be lost. Similarly, if a user signs in via an incognito window and they then close all incognito windows, Clerk's session cookie will be lost. Both of these scenarios will cause the user to have to sign in again.

### Google Chrome

Cookies set in Google Chrome have a `Max-Age` upper limit of [400 days](https://developer.chrome.com/blog/cookie-max-age-expires). Users who are using Google Chrome will be signed out within 400 days, even if session lifetime is set to a longer duration. There is no workaround for this.

This is per the [HTTP Working Group Specification](https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#section-5.5) which is likely to get implemented by other browsers in the near future.

## Multi-session applications

A multi-session application is an application that allows multiple accounts to be signed in from the same browser at the same time. The user can switch from one account to another seamlessly. Each account is independent from the rest and has access to different resources.

To enable multi-session in your application, you need to configure it in the Clerk Dashboard.

1. In the Clerk Dashboard, navigate to the [**Sessions**](https://dashboard.clerk.com/last-active?path=sessions) page.
2. Toggle on **Multi-session handling**.
3. Select **Save**.

### Add multi-session support to your app

There are two main ways to add the multi-session feature to your application:

* Use the <SDKLink href="/docs/:sdk:/components/user/user-button" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserButton /></SDKLink> component if you want to use a prebuilt UI.
* [Build a custom flow](/docs/custom-flows/multi-session-applications) if you want to rebuild the existing Clerk flow using the Clerk API.

It's highly recommended to wrap your application with the following `<MultisessionAppSupport />` component. The fragment's `key` is set to the session ID. Every time the session ID changes, the `key` changes, forcing React to recreate the entire component tree under the fragment and guaranteeing a full rerendering cycle.

```tsx
function MultisessionAppSupport({ children }: { children: React.ReactNode }) {
  const { session } = useSession()

  return <React.Fragment key={session ? session.id : 'no-users'}>{children}</React.Fragment>
}
```

The following example demonstrates adding multi-session support to a Next.js App Router application. It requires creating the `<MultisessionAppSupport />` as a client component, and then using it in the `app/layout.tsx` file to wrap the entire application. This ensures the `layout.tsx` remains a server component.

<CodeBlockTabs options={["app/layout.tsx", "MultisessionAppSupport.tsx"]}>
  ```tsx {{ filename: 'app/layout.tsx' }}
  import React from 'react'
  import { ClerkProvider } from '@clerk/nextjs'
  import { MultisessionAppSupport } from './components/MultisessionAppSupport'

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <ClerkProvider afterMultiSessionSingleSignOutUrl="/">
          <MultisessionAppSupport>
            <body>{children}</body>
          </MultisessionAppSupport>
        </ClerkProvider>
      </html>
    )
  }
  ```

  ```tsx {{ filename: 'app/components/MultisessionAppSupport.tsx' }}
  'use client'

  import React from 'react'
  import { useSession } from '@clerk/nextjs'

  export default function MultisessionAppSupport({ children }: { children: React.ReactNode }) {
    const { session } = useSession()

    return <React.Fragment key={session ? session.id : 'no-users'}>{children}</React.Fragment>
  }
  ```
</CodeBlockTabs>

### Sign out behavior

By default, signing out from a currently active account in a multi-session app will navigate to the sign-in page's `/choose` route.

If a sign-in URL is not set, signing out will navigate to Clerk's Account Portal `/sign-in/choose` page, allowing the user to choose which account to switch into.

If a sign-in URL is set, either through the <SDKLink href="/docs/:sdk:/components/clerk-provider" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>signInUrl</SDKLink> prop on `<ClerkProvider>` or the [`CLERK_SIGN_IN_URL` environment variable](/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects), signing out will navigate to that URL's `/choose` route. For example, if `signInUrl` or `CLERK_SIGN_IN_URL` is set to `https://example.com/sign-in`, signing out of a multi-session app will navigate to `https://example.com/sign-in/choose`.

<If sdk={["nextjs", "react", "expo", "react-router", "tanstack-react-start"]}>
  To redirect to a custom route, pass the <SDKLink href="/docs/:sdk:/components/clerk-provider#properties" sdks={["chrome-extension","expo","nextjs","react","react-router","remix","tanstack-react-start"]} code={true}>afterMultiSessionSingleSignOutUrl</SDKLink> property to `<ClerkProvider>`.
</If>

## Customize session token

Session tokens are JWTs that contain a set of [default claims](/docs/backend-requests/resources/session-tokens) required by Clerk. You can customize these tokens by providing additional claims of your own.

To learn how to customize session tokens, see the [dedicated guide](/docs/backend-requests/custom-session-token).
---
title: Social connections (OAuth)
description: Learn how to effortlessly add social connections to your
  application using popular social providers like Google, Facebook, Github and
  more.
lastUpdated: 2025-07-23T20:37:01.000Z
---

Social connections, also known as OAuth connections in Clerk, allow users to gain access to your application by using their existing credentials from an Identity Provider (IdP), like Google or Microsoft. For example, if you enable Google as a social provider, then when a user wants to sign in to your application, they can select Google and use their Google account to sign in.

> \[!NOTE]
> When using social connections, the sign-up and sign-in flows are equivalent. If a user doesn't have an account and tries to sign in, an account will be made for them, and vice versa.

The easiest way to add social connections to your Clerk app is by using [prebuilt components](/docs/components/overview). If prebuilt components don't meet your specific needs or if you require more control over the logic, you can [rebuild the existing Clerk flows using the Clerk API](/docs/custom-flows/oauth-connections).

## Before you start

* You need to create a Clerk application in the [Clerk Dashboard](https://dashboard.clerk.com/). For more information, check out the <SDKLink href="/docs/quickstarts/setup-clerk" sdks={["nextjs"]}>setup guide</SDKLink>.
* You need to install the correct SDK for your application. For more information, see the [quickstart guides](/docs/quickstarts/overview).

## Enable a social connection

### Development instances

For **development** instances, Clerk uses **pre-configured shared** OAuth credentials and redirect URIs to make the development flow as smooth as possible. This means that you can enable most social providers **without additional configuration**.

To enable a social connection:

1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
2. Select the **Add connection** button, and select **For all users**.
3. In the **Choose provider** dropdown, select the provider you want to use.
4. Select **Add connection**.

### Production instances

For **production** instances, you will need to configure the provider with custom OAuth credentials. See the social provider's [dedicated guide](/docs/authentication/social-connections/oauth) for more information.

## Configure additional OAuth scopes

Each OAuth provider requires a specific set of scopes that are necessary for proper authentication with Clerk. These essential scopes are pre-configured and automatically included by Clerk. They typically include permissions for basic profile information and email access, which are fundamental for user authentication and account creation.

In addition to the core scopes, you can specify additional scopes supported by the provider. These scopes can be used to access additional user data from the provider.

To add additional OAuth scopes, when you are [enabling a new social connection](#enable-a-social-connection), enable **Use custom credentials**. The **Scopes** field will appear.

## Request additional OAuth scopes after sign-up

Clerk allows you to request additional OAuth scopes even after a user has signed up.

Pass the <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>additionalOAuthScopes</SDKLink> prop to the <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserProfile/></SDKLink> or <SDKLink href="/docs/:sdk:/components/user/user-button" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserButton /></SDKLink> component, with any additional OAuth scope you would like per provider. The user will be prompted to reconnect their account on their user profile page.

Use the following tabs to see how to add additional OAuth scopes to the `<UserProfile/>` and `<UserButton/>` components.

<CodeBlockTabs options={["<UserProfile />", "<UserButton />"]}>
  ```tsx {{ filename: 'app/page.tsx' }}
  <UserProfile
    additionalOAuthScopes={{
      google: ['foo', 'bar'],
      github: ['qux'],
    }}
  />
  ```

  ```tsx {{ filename: 'app/page.tsx' }}
  <UserButton
    userProfileProps={{
      additionalOAuthScopes: {
        google: ['foo', 'bar'],
        github: ['qux'],
      },
    }}
  />
  ```
</CodeBlockTabs>

## Get an OAuth access token for a social provider

You can use a social provider's OAuth access token to access user data from that provider in addition to their data from Clerk.

To retrieve the OAuth access token for a user, use the <SDKLink href="/docs/references/backend/user/get-user-oauth-access-token" sdks={["js-backend"]} code={true}>getUserOauthAccessToken()</SDKLink> method from the JavaScript Backend SDK. This method must be used in a server environment, and cannot be run on the client.

Clerk ensures that the OAuth access token will be always fresh so that you don't have to worry about refresh tokens.

The following example demonstrates how to retrieve the OAuth access token for a user and use it to fetch user data from the Notion API. It assumes:

* You have already [enabled the Notion social connection in the Clerk Dashboard](/docs/authentication/social-connections/notion).
* The user has already connected their Notion account to your application.
* The user has the correct permissions to access the Notion API.

The example is written for Next.js App Router, but is supported by any React-based framework.

```tsx {{ filename: 'app/api/notion/route.tsx' }}
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ message: 'User not found' })
  }

  // Get the OAuth access token for the user
  const provider = 'notion'

  const client = await clerkClient()

  const clerkResponse = await client.users.getUserOauthAccessToken(userId, provider)

  const accessToken = clerkResponse[0].token || ''

  if (!accessToken) {
    return NextResponse.json({ message: 'Access token not found' }, { status: 401 })
  }

  // Fetch the user data from the Notion API
  // This endpoint fetches a list of users
  // https://developers.notion.com/reference/get-users
  const notionUrl = 'https://api.notion.com/v1/users'

  const notionResponse = await fetch(notionUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
    },
  })

  // Handle the response from the Notion API
  const notionData = await notionResponse.json()

  return NextResponse.json({ message: notionData })
}
```

## Add a social connection after sign-up

For each social provider, you can disable the option to sign up and sign in to your application using the provider. This is especially useful for users that want to connect their OAuth account *after* authentication.

For example, say your application wants to read a user's GitHub repository data but doesn't want to allow the user to authenticate with their GitHub account. The user can sign up with their email and password, or whatever authentication method you choose, and then afterwards, connect their GitHub account to your application through their user profile. The easiest way to enable this for your users is by using the <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserProfile /></SDKLink> component. If you prefer to build a custom user interface, see how to [build a social connection flow using the Clerk API](/docs/custom-flows/oauth-connections).

To configure the option for users to sign up and sign in with a social provider:

1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
2. Select the social provider you want to configure.
3. Enable or disable **Enable for sign-up and sign-in**.
4. Save the changes.

## Connecting to social providers while signed in

When signed in, a user can connect to further social providers. There is no need to perform another sign-up.

When using the [Account Portal](/docs/account-portal/overview) pages, users can see which providers they have already connected to and which ones they can still connect to on their [user profile page](/docs/account-portal/overview#user-profile).

When using the [prebuilt components](/docs/components/overview), you can use the <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserProfile/></SDKLink> component to allow users to connect to further social providers.

## OAuth for native applications

Currently, the prebuilt components are not supported in native applications, but you can use the Clerk API to [build a custom flow for authenticating with social connections](/docs/custom-flows/oauth-connections).

Clerk ensures that security critical nonces are passed only to allowlisted URLs when the OAuth flow is completed in native browsers or webviews. For maximum security in your **production** instances, you need to allowlist your custom redirect URLs via the [Clerk Dashboard](https://dashboard.clerk.com/) or the <SDKLink href="/docs/references/backend/redirect-urls/create-redirect-url" sdks={["js-backend"]}>Clerk Backend API</SDKLink>.

To allowlist a redirect URL via the Clerk Dashboard:

1. In the Clerk Dashboard, navigate to the [**Native applications**](https://dashboard.clerk.com/last-active?path=native-applications) page.
2. Scroll to the **Allowlist for mobile OAuth redirect** section and add your redirect URLs.

## OAuth for Apple native applications

You can use [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/) to offer a native authentication experience in your iOS, watchOS, macOS or tvOS apps.

Instead of the typical OAuth flow that performs redirects in a browser context, you can utilize Apple's native authorization and provide the openID token and grant code to Clerk. Clerk ensures that the user will be verified in a secure and reliable way with the information that Apple has provided about the user.

For additional information on how to configure Apple as a social provider for your Clerk instance, see the [dedicated guide](/docs/authentication/social-connections/apple).
---
title: Account linking for OAuth
description: Learn how Clerk handles account linking and manages unverified
  email addresses from OAuth providers.
lastUpdated: 2025-07-23T20:37:01.000Z
---

Account linking is the process of connecting multiple user accounts from different services or platforms, allowing users to access various services with a single set of credentials. By using the email address as the common identifier, Clerk automatically attempts to link accounts whenever possible. Account linking is triggered when an OAuth provider returns an email address that matches an existing account, assuming a single owner for each email address.

## How it works

When a user attempts to sign in or sign up, Clerk first checks the provided email address. Clerk will attempt to link the OAuth account with any existing Clerk account that shares the same email address.

In the following sections, we'll look at the different scenarios that can occur during this process and explain how Clerk handles each one.

![Flow chart of the account linking process in various scenarios](/docs/images/authentication/account-linking-flow-oauth.webp)

### Email address is verified in both OAuth and Clerk

When a user signs in to your app using an OAuth provider that returns a **verified** email address, Clerk links the OAuth account to the existing account and signs the user in. This even applies to password-protected accounts, as the OAuth sign-in process automatically bypasses password verification.

### Email address is verified in Clerk but not in OAuth

When a user signs in to your app using an OAuth provider that returns an **unverified** email address, Clerk will initiate a verification process. Once the email address is verified, the OAuth account is linked to the existing one, and the user is signed in.

### Email address is unverified in Clerk

By default, users are required to verify their email addresses before they can sign up.

If you disabled the **Verify at sign-up** option in the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=user-authentication/email-phone-username), users will be able to sign up without verifying their email addresses.

When a user signs up with an **unverified** email address and later attempts to sign in with an OAuth provider, Clerk implements security measures to prevent potential account takeovers. For example, if an account was created with an unverified email/password combination and the user later signs in with Google (where the email is verified), Clerk will prompt the user to change their password before linking the accounts. This process begins with email verification, regardless of the method used. After successful verification, Clerk may require additional steps, such as validating existing connections or passwords, to ensure the account's security. These measures are in place because Clerk cannot confirm the original ownership of the account, which could otherwise lead to unauthorized access.

## Users with different email addresses

If a user has a different email from the one associated with the OAuth account, they can manually associate the two by following these steps:

1. Sign in to their Clerk application with the account that uses their main email address.
2. In the <SDKLink href="/docs/:sdk:/components/user/user-profile" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<UserProfile /></SDKLink>, add the different email.

After following these steps, the user's OAuth accounts associated with both their primary and added email addresses will be linked to their main account.
---
title: Add Google as a social connection
description: Learn how to allow users to sign up and sign in to your Clerk app
  with their Google account using OAuth.
lastUpdated: 2025-07-23T20:37:01.000Z
---

<TutorialHero
  beforeYouStart={[
    {
      title: "A Clerk application is required.",
      link: "/docs/quickstarts/setup-clerk",
      icon: "clerk",
    },
    {
      title: "A Google Developer account is required.",
      link: "https://console.developers.google.com/",
      icon: "user-circle",
    }
  ]}
/>

Enabling OAuth with [Google](https://developers.google.com/identity/protocols/oauth2) allows your users to sign up and sign in to your Clerk application with their Google account.

> \[!WARNING]
> Google OAuth 2.0 **does not** allow apps to use WebViews for authentication. See the dedicated [Google blog post](https://developers.googleblog.com/en/modernizing-oauth-interactions-in-native-apps-for-better-usability-and-security) for more information. If your app requires users to sign in via in-app browsers, follow the setup instructions in the [Google Help guide](https://support.google.com/faqs/answer/12284343).

## Configure for your development instance

For *development instances*, Clerk uses preconfigured shared OAuth credentials and redirect URIs—no other configuration is needed.

1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
2. Select **Add connection** and select **For all users**.
3. In the **Choose provider** dropdown, select **Google**.
4. Select **Add connection**.

## Configure for your production instance

For *production instances*, you must provide custom credentials.

To make the setup process easier, it's recommended to keep two browser tabs open: one for the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) and one for your [Google Cloud Console](https://console.cloud.google.com/).

<Steps>
  ### Enable Google as a social connection

  1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
  2. Select **Add connection** and select **For all users**.
  3. In the **Choose provider** dropdown, select **Google**.
  4. Ensure that both **Enable for sign-up and sign-in** and **Use custom credentials** are toggled on.
  5. Save the **Authorized Redirect URI** somewhere secure. Keep this modal and page open.

  ### Create a Google Developer project

  1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
  2. Select a project or [create a new one](https://console.cloud.google.com/projectcreate). You'll be redirected to your project's **Dashboard** page.
  3. In the top-left, select the menu icon (**≡**) and select **APIs & Services**. Then, select **Credentials**.
  4. Next to **Credentials**, select **Create Credentials**. Then, select **OAuth client ID.** You might need to [configure your OAuth consent screen](https://support.google.com/cloud/answer/6158849#userconsent). Otherwise, you'll be redirected to the **Create OAuth client ID** page.
  5. Select the appropriate application type for your project. In most cases, it's **Web application**.
  6. In the **Authorized JavaScript origins** setting, select **Add URI** and add your domain (e.g., `https://your-domain.com` and `https://www.your-domain.com` if you have a `www` version). For local development, add `http://localhost:PORT` (replace `PORT` with the port number of your local development server).
  7. In the **Authorized Redirect URIs** setting, paste the **Authorized Redirect URI** value you saved from the Clerk Dashboard.
  8. Select **Create**. A modal will open with your **Client ID** and **Client Secret**. Save these values somewhere secure.

  ### Set the Client ID and Client Secret in the Clerk Dashboard

  1. Navigate back to the Clerk Dashboard where the modal should still be open. Paste the **Client ID** and **Client Secret** values that you saved into the respective fields.
  2. Select **Add connection**.

  > \[!NOTE]
  > If the modal or page is no longer open, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page in the Clerk Dashboard. Select the connection. Under **Use custom credentials**, paste the values into their respective fields.

  ### Test your connection

  The simplest way to test your connection is to visit your Clerk app's [Account Portal](/docs/account-portal/overview), which is available for all Clerk apps out-of-the-box.

  1. In the Clerk Dashboard, navigate to the [**Account Portal**](https://dashboard.clerk.com/last-active?path=account-portal) page.
  2. Next to the **Sign-in** URL, select **Visit**. The URL should resemble:
     * **For development** – `https://your-domain.accounts.dev/sign-in`
     * **For production** – `https://accounts.your-domain.com/sign-in`
  3. Sign in with your connection's credentials.

  > \[!WARNING]
  > Google sign-in [**does not** allow users to sign in via in-app browsers](https://developers.googleblog.com/en/modernizing-oauth-interactions-in-native-apps-for-better-usability-and-security).
</Steps>

### Important note about switching to production

Google OAuth apps have a publishing status that determines who can access the app. The publishing status setting can be found in the Google Cloud Platform console on the **APIs & Services > OAuth consent screen** page. You can only view the publishing status if the **User type** is set to **External**.

By default, Google OAuth apps are set to the **"Testing"** [publishing status](https://support.google.com/cloud/answer/10311615#publishing-status), which is intended for internal testing before opening connections to your [intended audience](https://support.google.com/cloud/answer/10311615#user-type). It's limited to 100 test users and depending on the requested OAuth scopes, they might need to be explicitly added to your trusted user list to be able to connect.

To switch a Google OAuth app to production, **you must set the publishing status to "In production".** This involves a verification process with regard to your app name, logo, and scopes requested before Google accepts the switch to production.

Ensure that your Clerk production app always uses a corresponding Google OAuth app that is set to the **"In production"** publishing status, so your end users don't encounter any issues using Google as a social connection.

### Block email subaddresses

By default, your app will block any Google account with an email address that contains the characters `+`, `=` or `#` from being able to sign up, sign in, or be added to existing accounts.

For a Google organization with the domain `example.com`, blocking email subaddresses prevents someone with access to `user@example.com` from signing up with `user+alias@example.com`. This is a known [Google OAuth vulnerability](https://trufflesecurity.com/blog/google-oauth-is-broken-sort-of/) that could allow unauthorized, as Google organization administrators cannot suspend or delete the email alias account. It's recommended to keep this setting enabled for enhanced security.

To configure this setting:

1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
2. Select the **Google** connection.
3. Enable or disable **Block email subaddresses**.

> \[!NOTE]
> Existing Google accounts with email subaddresses will be blocked by this restriction and won't be able to sign in.

## Google One Tap

[Google One Tap](https://developers.google.com/identity/gsi/web/guides/features) enables users to sign up or sign in to your Clerk app with the press of a button. After adding Google to your Clerk app as a social connection, you can use the prebuilt `<GoogleOneTap />` component to render the One Tap UI in your app. See <SDKLink href="/docs/:sdk:/components/authentication/google-one-tap" sdks={["astro","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]}>the `<GoogleOneTap />` component reference</SDKLink> to learn more.
---
title: Add Facebook as a social connection
description: Learn how to allow users to sign up and sign in to your Clerk app
  with their Facebook account using OAuth.
lastUpdated: 2025-07-23T20:37:01.000Z
---

<TutorialHero
  beforeYouStart={[
  {
    title: "A Clerk app is required.",
    link: "/docs/quickstarts/setup-clerk",
    icon: "clerk",
  },
  {
    title: "A Meta Developer account is required.",
    link: "https://developers.facebook.com/docs/development/register",
    icon: "user-circle",
  }
]}
/>

Enabling OAuth with Facebook allows your users to sign up and sign in to your Clerk app with their Facebook account.

## Configure for your development instance

For *development instances*, Clerk uses preconfigured shared OAuth credentials and redirect URIs—no other configuration is needed.

1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
2. Select **Add connection** and select **For all users**.
3. In the **Choose provider** dropdown, select **Facebook**.
4. Select **Add connection**.

## Configure for your production instance

For *production instances*, you must provide custom credentials.

To make the setup process easier, it's recommended to keep two browser tabs open: one for the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) and one for your [Facebook Developer](https://developers.facebook.com) page.

<Steps>
  ### Enable Facebook as a social connection

  1. In the Clerk Dashboard, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page.
  2. Select **Add connection** and select **For all users**.
  3. In the **Choose provider** dropdown, select **Facebook**.
  4. Ensure that both **Enable for sign-up and sign-in** and **Use custom credentials** are toggled on.
  5. Save the **Redirect URI** somewhere secure. Keep this modal and page open.

  ### Create a Facebook app

  1. In the top-right of the Facebook Developer page, select [**My Apps**](https://developers.facebook.com/apps).
  2. In the top-right, select **Create App**. You'll be redirected to the **Create an app** process.
     1. In the **App details** step, fill out the necessary information and select **Next**.
     2. In the **Use Cases** step, select **Authenticate and request data from users with Facebook Login** and then select **Next**.
     3. In the **Business** step, select the business portfolio to connect to your app and then select **Next**.
     4. In the **Finalize** step, select **Go to dashboard**. You'll be redirected to the app's **Dashboard** page.
  3. In the left sidenav, select **Use cases**.
  4. Next to **Authenticate and request data from users with Facebook Login**, select **Customize**. You'll be redirected to the **Permissions** tab of the **Customize use case** page.
  5. Next to **email**, select **Add**. This permission allows Clerk to read your user's primary email address.
  6. In the left sidenav, under **Facebook Login**, select **Settings**.
  7. In the **Client OAuth settings** section, in the **Valid OAuth Redirect URIs** field, paste the **Redirect URI** value you saved from the Clerk Dashboard.
  8. Select **Save changes**.
  9. In the left sidenav, select **App settings** (hover over the settings icon to view the title or expand the menu), and then select **Basic**.
  10. Save the **App ID** and **App Secret** somewhere secure.

  ### Set the App ID and App Secret in the Clerk Dashboard

  1. Navigate back to the Clerk Dashboard where the modal should still be open. Paste the **App ID** and **App Secret** values that you saved into the respective fields.
  2. Select **Add connection**.

  > \[!NOTE]
  > If the modal or page is not still open, navigate to the [**SSO connections**](https://dashboard.clerk.com/last-active?path=user-authentication/sso-connections) page in the Clerk Dashboard. Select the connection. Under **Use custom credentials**, you can paste the values into their respective fields.

  ### Test your connection

  The simplest way to test your connection is to visit your Clerk app's [Account Portal](/docs/account-portal/overview), which is available for all Clerk apps out-of-the-box.

  1. In the Clerk Dashboard, navigate to the [**Account Portal**](https://dashboard.clerk.com/last-active?path=account-portal) page.
  2. Next to the **Sign-in** URL, select **Visit**. The URL should resemble:
     * **For development** – `https://your-domain.accounts.dev/sign-in`
     * **For production** – `https://accounts.your-domain.com/sign-in`
  3. Sign in with your connection's credentials.
</Steps>
