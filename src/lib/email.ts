function emailButton(url: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
      <tr>
        <td style="background-color:#111111;border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:13px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;line-height:1;">${label}</a>
        </td>
      </tr>
    </table>`;
}

function emailLayout(title: string, body: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:48px 16px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="https://evvycal.app" style="text-decoration:none;">
                <span style="font-size:30px;font-weight:800;letter-spacing:-0.5px;">
                  <span style="color:#111111;">E</span><span style="color:#3b82f6;">v</span><span style="color:#111111;">vy.</span>
                </span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;border:1px solid #e4e4e7;padding:40px 40px 36px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">© ${year} Evvy · <a href="https://evvycal.app" style="color:#a1a1aa;text-decoration:underline;">evvycal.app</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPasswordResetEmail(url: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Reset your password</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">You requested a password reset for your Evvy account.</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    ${emailButton(url, "Reset my password")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">If you didn't request this, you can safely ignore this email — your password won't change.</p>`;
  return emailLayout("Reset your Evvy password", body);
}

export function buildEmailChangeEmail(newEmail: string, confirmUrl: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Confirm your email change</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">You requested to change your Evvy email address to:</p>
    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111111;">${newEmail}</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">Click the button below to confirm. This link expires in <strong>1 hour</strong>.</p>
    ${emailButton(confirmUrl, "Confirm email change")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">If you didn't request this, you can safely ignore this email — your address won't change.</p>`;
  return emailLayout("Confirm your Evvy email change", body);
}
