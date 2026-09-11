import { Vendor, VendorSetting } from '@/features/vendorIdCard/types/vendor';
import { Colors, Fonts } from '@/theme/colors'; // adjust path to your theme file

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatIssueDate = (dateString: string): string => {
      if (!dateString) return '—';
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
};

const getInitial = (name: string): string => {
      if (!name) return '?';
      return name.trim().charAt(0).toUpperCase();
};

const escapeHtml = (value: string): string =>
      (value ?? '').replace(
            /[&<>"']/g,
            char =>
            ({
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  '"': '&quot;',
                  "'": '&#39;',
            }[char] as string),
      );

// ---------------------------------------------------------------------------
// HTML template — mirrors the on-screen card 1:1 using the shared theme
// ---------------------------------------------------------------------------
export function buildVendorIdCardHtml(
      vendor: Vendor,
      setting: VendorSetting,
): string {
      const initial = escapeHtml(getInitial(vendor.name));
      const name = escapeHtml(vendor.name);
      const role = escapeHtml((vendor.role || 'GENERAL PARTNER').toUpperCase());
      const business = escapeHtml(vendor.businessName || '');
      const title = escapeHtml(setting.title || 'Service Partner');
      const vendorId = escapeHtml(vendor.vendorId || '—');
      const email = escapeHtml(vendor.email || '—');
      const phone = escapeHtml(vendor.phone || '—');
      const issueDate = escapeHtml(
            formatIssueDate(vendor.verificationDate || vendor.createdAt),
      );

      const avatarBlock = vendor.profileImage
            ? `<img src="${vendor.profileImage}" class="avatar-img" />`
            : `<div class="avatar-placeholder"><span>${initial}</span></div>`;

      const signatureBlock = setting.signatureUrl
            ? `<img src="${setting.signatureUrl}" class="signature-img" />`
            : `<div class="signature-script">Auth Signatory</div>`;

      return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { margin: 0; }
          body {
            margin: 0;
            padding: 40px 0;
            display: flex;
            justify-content: center;
            background: ${Colors.background};
            font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif;
          }
          .card {
            width: 380px;
            border-radius: 24px;
            overflow: hidden;
            background: ${Colors.white};
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          }
          .card-header {
            background: linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientMid}, ${Colors.gradientEnd});
            padding: 28px 20px 24px;
            text-align: center;
          }
          .logo-placeholder {
            width: 44px;
            height: 44px;
            margin: 0 auto 10px;
            border-radius: 12px;
            background: rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${Colors.white};
            font-size: ${Fonts.sizes.xxl}px;
            font-weight: 700;
          }
          .card-header h1 {
            margin: 0;
            color: ${Colors.textLight};
            font-size: ${Fonts.sizes.lg}px;
            font-weight: 800;
          }
          .card-header p {
            margin: 6px 0 0;
            color: ${Colors.textLight};
            font-size: ${Fonts.sizes.xs}px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .card-body {
            padding: 28px 24px 24px;
            text-align: center;
          }
          .avatar-wrap {
            position: relative;
            width: 96px;
            height: 96px;
            margin: 0 auto 16px;
          }
          .avatar-img {
            width: 96px;
            height: 96px;
            border-radius: 48px;
            object-fit: cover;
          }
          .avatar-placeholder {
            width: 96px;
            height: 96px;
            border-radius: 48px;
            background: ${Colors.background};
            border: 1px solid #E4ECEF;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .avatar-placeholder span {
            font-size: ${Fonts.sizes.hero}px;
            font-weight: 700;
            color: ${Colors.textMuted};
          }
          .verified-badge {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background: ${Colors.gradientStart};
            border: 2px solid ${Colors.white};
            color: ${Colors.white};
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .name {
            margin: 0;
            font-size: ${Fonts.sizes.xxl}px;
            font-weight: 800;
            color: ${Colors.textDark};
          }
          .role {
            margin: 4px 0 0;
            font-size: ${Fonts.sizes.sm}px;
            font-weight: 700;
            color: ${Colors.gradientEnd};
            letter-spacing: 0.5px;
          }
          .business {
            margin: 2px 0 0;
            font-size: ${Fonts.sizes.sm}px;
            color: ${Colors.textMuted};
          }
          .details {
            margin-top: 20px;
            background: ${Colors.background};
            border-radius: 14px;
            padding: 4px 18px;
            text-align: left;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #E4ECEF;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label {
            font-size: ${Fonts.sizes.xs}px;
            font-weight: 600;
            letter-spacing: 0.5px;
            color: ${Colors.textMuted};
          }
          .detail-value {
            font-size: ${Fonts.sizes.md}px;
            font-weight: 700;
            color: ${Colors.textDark};
          }
          .signature-wrap {
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .signature-script {
            font-style: italic;
            font-size: ${Fonts.sizes.md}px;
            color: ${Colors.textMedium};
          }
          .signature-img {
            height: 40px;
            object-fit: contain;
          }
          .signature-line {
            width: 160px;
            height: 1px;
            background: #C7D6DC;
            margin-top: 8px;
          }
          .signature-label {
            margin-top: 4px;
            font-size: ${Fonts.sizes.xs}px;
            font-weight: 600;
            letter-spacing: 1px;
            color: ${Colors.textMuted};
          }
          .card-footer {
            height: 6px;
            background: linear-gradient(90deg, ${Colors.gradientStart}, ${Colors.gradientMid}, ${Colors.gradientEnd});
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="card-header">
            <div class="logo-placeholder">+</div>
            <h1>${title}</h1>
            <p>REGISTERED MEDICAL PARTNER</p>
          </div>
          <div class="card-body">
            <div class="avatar-wrap">
              ${avatarBlock}
              ${vendor.isVerified ? '<div class="verified-badge">&#10003;</div>' : ''}
            </div>
            <p class="name">${name}</p>
            <p class="role">${role}</p>
            ${business ? `<p class="business">${business}</p>` : ''}
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">PARTNER ID</span>
                <span class="detail-value">${vendorId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">EMAIL</span>
                <span class="detail-value">${email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">MOBILE</span>
                <span class="detail-value">${phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ISSUE DATE</span>
                <span class="detail-value">${issueDate}</span>
              </div>
            </div>
            <div class="signature-wrap">
              ${signatureBlock}
              <div class="signature-line"></div>
              <div class="signature-label">AUTHORIZED SIGN</div>
            </div>
          </div>
          <div class="card-footer"></div>
        </div>
      </body>
    </html>
  `;
}