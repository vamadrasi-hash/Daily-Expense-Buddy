export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: April 12, 2026</p>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using SpendWise, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Description of Service</h2>
          <p>SpendWise is a personal expense tracking application that allows users to record expenses, set budgets, manage categories, and view spending analytics.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. User Accounts</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You are responsible for all activity that occurs under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Acceptable Use</h2>
          <p>You agree not to misuse the service, attempt to gain unauthorized access, or use the service for any unlawful purpose.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Data Ownership</h2>
          <p>You retain ownership of all data you enter into SpendWise. We do not claim any intellectual property rights over your content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Service Availability</h2>
          <p>We strive to keep SpendWise available at all times but do not guarantee uninterrupted access. The service is provided "as is" without warranties of any kind.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Limitation of Liability</h2>
          <p>SpendWise shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. You may also delete your account at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use of SpendWise after changes constitutes acceptance of the updated terms.</p>
        </section>
      </div>
    </div>
  );
}
