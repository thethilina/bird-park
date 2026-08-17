import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Logo from "@/public/images/birdparklogo.png"

export const metadata = {
  title: 'Privacy Policy — Bird Park',
  description: 'Learn how Bird Park collects, uses, and protects your personal information.',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-lg sm:text-xl font-semibold text-[#DEBE83]">{title}</h2>
    <div className="text-gray-400 leading-relaxed text-sm sm:text-base space-y-2">{children}</div>
  </div>
)

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-5 py-12 sm:px-10 md:px-20 lg:px-40 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-12 space-y-4">
        <Link href="/Login" className="flex items-center gap-3 w-fit group">
          <Image src={Logo} alt="Bird Park Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-light tracking-wide text-gray-300 group-hover:text-white transition-colors">Bird Park</span>
        </Link>

        <div className="space-y-1 pt-4">
          <p className="text-xs font-medium tracking-widest text-gray-500 uppercase">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-light text-[#DEBE83]">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: August 2025</p>
        </div>
      </div>

      {/* Intro */}
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-10 border-l-2 border-[#DEBE83]/30 pl-4">
        Your privacy matters to us. This policy explains what information Bird Park collects, how we use it, 
        and the choices you have around that data. We keep it simple because we have nothing to hide.
      </p>

      {/* Sections */}
      <div className="space-y-10 divide-y divide-white/5">

        <Section title="1. Information We Collect">
          <p>When you register for Bird Park, we collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your name, username, and email address</li>
            <li>Your date of birth (to verify age eligibility)</li>
            <li>Your profile photo</li>
            <li>Content you upload — artworks, poems, and collections</li>
          </ul>
          <p>We also automatically collect basic usage data such as your IP address, browser type, and pages visited to help us improve the platform.</p>
        </Section>

        <div className="pt-10">
          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Provide and maintain the Bird Park service</li>
              <li>Personalise your experience and recommend connections</li>
              <li>Send account-related notifications (no marketing spam)</li>
              <li>Detect and prevent fraudulent or abusive behaviour</li>
              <li>Improve our platform based on usage patterns</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. How We Share Your Information">
            <p>We do not sell your personal data. Period.</p>
            <p>We may share information with trusted third-party service providers who assist us in operating the platform (e.g. cloud storage, analytics) — only to the extent necessary and under strict confidentiality agreements.</p>
            <p>We may disclose information if required to do so by law or in response to valid legal process.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Cookies">
            <p>Bird Park uses cookies and similar technologies to keep you logged in and remember your preferences. We do not use third-party advertising cookies.</p>
            <p>You can disable cookies in your browser settings, though this may affect the functionality of the platform.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Data Retention">
            <p>We retain your account data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where we are required to retain it for legal reasons.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p>You can manage most of these from your Settings page. For other requests, contact us through the platform.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Security">
            <p>We use industry-standard security practices to protect your data, including encrypted connections (HTTPS) and hashed password storage. However, no method of transmission over the internet is 100% secure.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Children's Privacy">
            <p>Bird Park is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have done so, we will delete such information promptly.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes via a notice on the platform. Your continued use after changes take effect constitutes acceptance of the revised policy.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. Contact">
            <p>Questions about this Privacy Policy? Reach out to us through the Bird Park platform and we&apos;ll be happy to help.</p>
          </Section>
        </div>

      </div>

      {/* Footer nav */}
      <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm text-gray-500">
        <Link href="/Login" className="hover:text-white transition-colors">← Back to Login</Link>
        <Link href="/Register" className="hover:text-white transition-colors">Create an Account</Link>
        <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
      </div>

    </div>
  )
}
