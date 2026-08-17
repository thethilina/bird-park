import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Logo from "@/public/images/birdparklogo.png"

export const metadata = {
  title: 'Terms of Service — Bird Park',
  description: 'Read the Terms of Service for Bird Park, the creative community for artists and poets.',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-lg sm:text-xl font-semibold text-[#DEBE83]">{title}</h2>
    <div className="text-gray-400 leading-relaxed text-sm sm:text-base space-y-2">{children}</div>
  </div>
)

export default function TermsOfService() {
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
          <h1 className="text-4xl sm:text-5xl font-light text-[#DEBE83]">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: August 2025</p>
        </div>
      </div>

      {/* Intro */}
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-10 border-l-2 border-[#DEBE83]/30 pl-4">
        Welcome to Bird Park. By using our platform, you agree to be bound by the following terms and conditions. 
        Please read them carefully before creating an account or posting any content.
      </p>

      {/* Sections */}
      <div className="space-y-10 divide-y divide-white/5">

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Bird Park, you confirm that you are at least 13 years of age and agree to these Terms of Service. If you are under 18, please ensure a parent or guardian has reviewed these terms.</p>
        </Section>

        <div className="pt-10">
          <Section title="2. Your Account">
            <p>You are responsible for maintaining the security of your account credentials. Bird Park is not liable for any loss or damage arising from unauthorised access to your account.</p>
            <p>You agree to provide accurate, current, and complete information during registration and to update such information as necessary.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. Content You Post">
            <p>You retain ownership of the content you create and publish on Bird Park. By posting, you grant Bird Park a non-exclusive, royalty-free licence to display and distribute your content within the platform.</p>
            <p>You must not post content that is abusive, harassing, defamatory, obscene, or infringes on any third-party intellectual property rights.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Community Guidelines">
            <p>Bird Park is a creative community built on respect. We expect all members to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Treat other artists with dignity and kindness</li>
              <li>Provide constructive feedback rather than personal attacks</li>
              <li>Respect the intellectual property of others</li>
              <li>Refrain from spam, impersonation, or misleading content</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Prohibited Activities">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to other accounts or our systems</li>
              <li>Upload viruses or any other malicious code</li>
              <li>Scrape, crawl, or otherwise systematically collect data from the platform</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Termination">
            <p>We reserve the right to suspend or terminate your account at any time if you violate these terms, without prior notice. You may also delete your account at any time from your Settings page.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Disclaimer of Warranties">
            <p>Bird Park is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or entirely secure.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Changes to Terms">
            <p>We may update these Terms of Service from time to time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Contact">
            <p>If you have any questions about these terms, please reach out to us through the platform.</p>
          </Section>
        </div>

      </div>

      {/* Footer nav */}
      <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-sm text-gray-500">
        <Link href="/Login" className="hover:text-white transition-colors">← Back to Login</Link>
        <Link href="/Register" className="hover:text-white transition-colors">Create an Account</Link>
        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
      </div>

    </div>
  )
}
