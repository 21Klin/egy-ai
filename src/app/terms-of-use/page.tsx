"use client";

import React from "react";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Terms of Use & Legal Protection
          </h1>
          
        </div>

        {/* Legal Card */}
        <div
          className="
            rounded-3xl border border-slate-800 bg-slate-900/60 
            p-8 shadow-[0_0_60px_rgba(56,189,248,0.15)]
            backdrop-blur-xl space-y-6
          "
        >
          <h2 className="text-xl font-semibold text-emerald-300">
            EGY AI — PROPRIETARY INTELLECTUAL PROPERTY LICENSE & PROTECTION NOTICE
          </h2>

          <p className="text-sm text-slate-400">
            
            Copyright © 2025 EGY AI. All rights reserved.
          </p>

          <Section title="1. Ownership & Scope of Protection">
            The EGY AI platform — including its software, algorithms, UI/UX
            design, branding, market-data architecture, trading logic, state
            management, concepts, workflow, and all intellectual property — is
            the exclusive property of EGY AI and its founders.
            <br /><br />
            This protection applies to every file, idea, description, algorithm,
            and structural element created by the team.
          </Section>

          <Section title="2. International Copyright Protection (Automatic & Worldwide)">
            EGY AI is protected under:
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-300">
              <li><b>Berne Convention</b> (North Macedonia accession 1991)</li>
              <li><b>WIPO Copyright Treaty (WCT)</b></li>
              <li><b>TRIPS Agreement (WTO)</b></li>
              <li><b>DMCA (United States)</b></li>
              <li><b>North Macedonia Copyright & Related Rights Act</b></li>
            </ul>
            Protection is global and automatic upon creation.  
          </Section>

          <Section title="3. Prohibited Actions (Strictly Forbidden)">
            Without written permission from the founders, you may NOT:
            <ul className="list-disc pl-6 mt-2 space-y-1 text-red-300">
              <li>Copy or reuse source code</li>
              <li>Replicate UI/UX, layout, or visual identity</li>
              <li>Fork, distribute, or create derivatives</li>
              <li>Reverse-engineer, decompile, or extract logic</li>
              <li>Reproduce trading logic or architecture</li>
              <li>Imitate the business concept or system flow</li>
              <li>Use the EGY AI name, branding, or content</li>
            </ul>
          </Section>

          <Section title="4. Legal Enforcement & Penalties">
            EGY AI may enforce rights using:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><b>DMCA Takedowns</b> (GitHub, Cloudflare, Vercel, etc.)</li>
              <li><b>Global Copyright Enforcement</b></li>
              <li><b>Civil litigation</b> including damages and injunctions</li>
              <li><b>Criminal prosecution</b> under North Macedonian law</li>
              <li><b>EU-wide enforcement</b> upon trademark registration</li>
            </ul>
          </Section>

          <Section title="5. Trademark Notice">
            “EGY AI” and all associated marks, logos, and visual identity
            components are exclusive trademarks of the EGY AI founders.  
            Unauthorized use is strictly prohibited.
          </Section>

          <Section title="6. No License Granted">
            The EGY AI platform is NOT open-source.
            <br /><br />
            You are granted <b>zero rights</b> to copy, modify, publish,
            distribute, host, analyze, or reverse-engineer any part of the
            platform.
          </Section>

          <Section title="7. Consequences of Infringement">
            Violations may result in:
            <ul className="list-disc pl-6 mt-2 space-y-1 text-red-300">
              <li>Permanent bans</li>
              <li>DMCA removals from all platforms</li>
              <li>Global takedowns and legal claims</li>
              <li>Financial penalties</li>
              <li>Criminal charges where applicable</li>
            </ul>
            EGY AI aggressively protects all intellectual property.
          </Section>

          <Section title="8. Licensing & Business Inquiries">
            Only the founders may authorize licensing.
            <br /><br />
            For official business inquiries:
            <br />
            
                
              
              <div className="mt-3">
  <a
    href="https://egy-ai.pages.dev/contact"
    className="
      inline-flex items-center justify-center 
      px-4 py-2 rounded-full text-sm font-semibold 
      bg-gradient-to-r from-purple-500 to-emerald-400 
      text-slate-950 shadow-lg shadow-purple-500/30
      transition-all duration-300 
      hover:scale-[1.05] hover:shadow-purple-500/50 
      active:scale-[0.97]
    "
  >
    Contact Page →
  </a>
</div>

            
            
            
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Reusable section component         */
/* ---------------------------------- */
function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-cyan-300">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}
