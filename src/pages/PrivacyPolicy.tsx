export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: April 12, 2026</p>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Information We Collect</h2>
          <p>SpendWise collects the following information when you use our service:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Account information (name, email address) provided during registration or Google Sign-In</li>
            <li>Expense data, budgets, and categories you create within the app</li>
            <li>Currency preferences and app settings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide and maintain the SpendWise expense tracking service</li>
            <li>Authenticate your identity and secure your account</li>
            <li>Sync your data across devices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We do not sell, trade, or share your personal data with third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Third-Party Services</h2>
          <p>SpendWise uses Google Sign-In for authentication. When you sign in with Google, we receive your name and email address as permitted by your Google account settings. Please refer to Google's Privacy Policy for details on how Google handles your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Data Deletion</h2>
          <p>You may request deletion of your account and all associated data at any time by contacting us. Upon deletion, all your expense records, categories, and settings will be permanently removed.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Contact</h2>
          <p>If you have questions about this Privacy Policy, please reach out through the app.</p>
        </section>
      </div>
    </div>
  );
}
