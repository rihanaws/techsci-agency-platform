import type { AuditOutput } from '../claude/audit'
import type { SpecOutput } from '../claude/spec'

export function generateAuditHtml(data: AuditOutput): string {
  const severityColors = {
    low: { bg: '#eefcfd', text: '#1b5a6c', border: '#4f98a3' },
    medium: { bg: '#fffbeb', text: '#b45309', border: '#f59e0b' },
    high: { bg: '#fff1f2', text: '#be123c', border: '#f43f5e' },
    critical: { bg: '#fef2f2', text: '#991b1b', border: '#dc2626' },
  }

  const sectionsHtml = data.sections
    .map((sec) => {
      const colors = severityColors[sec.severity] ?? severityColors.low
      return `
        <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
          <div style="background-color: ${colors.bg}; border-bottom: 1px solid ${colors.border}; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 700;">${sec.title}</h3>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: #ffffff; border: 1px solid ${colors.border}; color: ${colors.text}; padding: 3px 8px; border-radius: 4px;">
              ${sec.severity}
            </span>
          </div>
          <div style="padding: 20px;">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; text-transform: uppercase; tracking: 0.05em;">Key Findings</h4>
            <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #334155; line-height: 1.5; font-size: 14px;">
              ${sec.findings.map((f) => `<li style="margin-bottom: 8px;">${f}</li>`).join('')}
            </ul>
            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; text-transform: uppercase; tracking: 0.05em;">Recommendations</h4>
            <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.5; font-size: 14px;">
              ${sec.recommendations.map((r) => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      `
    })
    .join('')

  const roadmapHtml = data.roadmap
    .map((item) => {
      const priorityColors = {
        P0: '#dc2626',
        P1: '#f59e0b',
        P2: '#3b82f6',
      }
      const color = priorityColors[item.priority] ?? '#64748b'
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-weight: 700; color: ${color}; font-size: 14px; width: 60px;">${item.priority}</td>
          <td style="padding: 12px 16px; color: #334155; font-size: 14px;">${item.action}</td>
          <td style="padding: 12px 16px; color: #64748b; font-size: 13px; width: 120px; text-align: right;">${item.estimatedEffort}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Infrastructure Security Audit</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
        }
        .header {
          border-bottom: 2px solid #4f98a3;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .title {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .meta {
          font-size: 12px;
          color: #64748b;
          text-align: right;
        }
        .summary-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
          display: flex;
          gap: 24px;
        }
        .summary-text {
          flex: 1;
        }
        .score-box {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4f98a3; tracking: 0.05em;">Infrastructure Security Audit</p>
          <h1 class="title">Security Assessment & Audit Report</h1>
        </div>
        <div class="meta">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">Rihan Consulting</p>
          <p style="margin: 0;">Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-text">
          <h2 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #0f172a;">Executive Summary</h2>
          <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${data.executiveSummary}</p>
        </div>
        <div class="score-box">
          <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Risk Score</span>
          <span style="font-size: 32px; font-weight: 700; color: ${data.riskScore > 70 ? '#dc2626' : data.riskScore > 40 ? '#f59e0b' : '#16a34a'};">${data.riskScore}</span>
          <span style="font-size: 9px; color: #94a3b8; font-weight: 500;">out of 100</span>
        </div>
      </div>

      <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; border-left: 4px solid #4f98a3; padding-left: 10px;">Detailed Assessment</h2>
      ${sectionsHtml}

      <div style="page-break-before: always; padding-top: 20px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; border-left: 4px solid #4f98a3; padding-left: 10px;">Remediation Roadmap</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b;">
              <th style="padding: 12px 16px;">Priority</th>
              <th style="padding: 12px 16px;">Remediation Action</th>
              <th style="padding: 12px 16px; text-align: right;">Est. Effort</th>
            </tr>
          </thead>
          <tbody>
            ${roadmapHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 50px; border-t: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; page-break-inside: avoid;">
        <p>This document is generated automatically by the Rihan Consulting Autonomous Agency Platform.</p>
        <p>Contact hello@rihan.cloud for support or questions regarding this audit.</p>
      </div>
    </body>
    </html>
  `
}

export function generateSpecHtml(data: SpecOutput): string {
  const modulesHtml = data.modules
    .map((mod) => {
      return `
        <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
          <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; border-radius: 12px; background-color: #4f98a3; color: white; display: flex; items-center; justify-content: center; font-size: 12px; font-weight: 700; line-height: 24px; text-align: center;">
              ${mod.order}
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #1e293b;">
              ${mod.app} &mdash; <span style="font-weight: 500; color: #475569;">${mod.action}</span>
            </div>
          </div>
          <div style="padding: 16px; display: flex; gap: 20px; font-size: 13px;">
            <div style="flex: 1;">
              <span style="font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase;">Inputs</span>
              <ul style="margin: 4px 0 0 0; padding-left: 16px; color: #334155;">
                ${mod.inputs.map((i) => `<li>${i}</li>`).join('')}
              </ul>
            </div>
            <div style="flex: 1;">
              <span style="font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase;">Outputs</span>
              <ul style="margin: 4px 0 0 0; padding-left: 16px; color: #334155;">
                ${mod.outputs.map((o) => `<li>${o}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Make.com Automation Specification</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
        }
        .header {
          border-bottom: 2px solid #4f98a3;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .title {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .meta {
          font-size: 12px;
          color: #64748b;
          text-align: right;
        }
        .summary-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4f98a3; tracking: 0.05em;">Automation Specification</p>
          <h1 class="title">${data.scenarioTitle}</h1>
        </div>
        <div class="meta">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">Rihan Consulting</p>
          <p style="margin: 0;">Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div class="summary-card">
        <div>
          <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Process Name</span>
          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">${data.processName}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Trigger Mode</span>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #4f98a3; text-transform: capitalize;">${data.triggerType}</p>
        </div>
      </div>

      <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; border-left: 4px solid #4f98a3; padding-left: 10px;">Scenario Architecture</h2>
      ${modulesHtml}

      <div style="page-break-before: always; padding-top: 20px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; border-left: 4px solid #4f98a3; padding-left: 10px;">Implementation Notes & API Requirements</h2>
        <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #334155;">Required API Access / Connection Credentials</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.5;">
            ${data.apiRequirements.map((r) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>

          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #334155;">Build & Launch Estimate</h3>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.5; font-weight: 600;">${data.buildEstimate}</p>

          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #334155;">Security & Operational Caveats</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.5;">
            ${data.caveats.map((c) => `<li style="margin-bottom: 6px;">${c}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="margin-top: 50px; border-t: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; page-break-inside: avoid;">
        <p>This document is generated automatically by the Rihan Consulting Autonomous Agency Platform.</p>
        <p>Contact hello@rihan.cloud for support or questions regarding this build.</p>
      </div>
    </body>
    </html>
  `
}
