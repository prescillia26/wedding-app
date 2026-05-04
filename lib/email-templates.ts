type Locale = 'fr' | 'en'

const t = {
  fr: {
    welcome: {
      subject: "Bienvenue sur Lov'it — Votre faire-part vous attend !",
      headerSub: 'Bienvenue !',
      thanks: 'Merci pour votre achat !',
      body: 'Votre faire-part digital est prêt à être créé. Cliquez sur le bouton ci-dessous pour accéder à votre espace et commencer la personnalisation.',
      cta: 'ACCÉDER À MON ESPACE',
      ctaSub: 'Ce lien vous connectera automatiquement.<br>Vous pourrez ensuite définir un mot de passe pour vous reconnecter facilement depuis n\'importe quel appareil.',
      passwordLink: 'Définir votre mot de passe directement',
      footer: "Avec amour,<br>L'équipe Lov'it",
    },
    promo: {
      subject: "Bienvenue sur Lov'it — Votre accès est activé !",
      headerSub: 'Accès activé !',
      body: 'Votre code promo a été validé. Votre faire-part digital est prêt à être créé.',
      passwordBody: 'Pour accéder à votre espace depuis n\'importe quel appareil, définissez votre mot de passe :',
      passwordCta: 'Définir votre mot de passe',
      magicSub: 'Vous pouvez aussi vous connecter directement avec ce lien magique :',
      magicLink: 'Se connecter sans mot de passe',
    },
    magicLink: {
      subject: "Votre lien de connexion Lov'it",
      headerSub: 'Lien de connexion',
      body: 'Cliquez sur le bouton ci-dessous pour vous connecter à votre espace Lov\'it. Ce lien est valable 15 minutes.',
      cta: 'Se connecter',
      ignore: 'Si vous n\'avez pas demandé ce lien, ignorez cet email.',
    },
    rsvp: {
      subject: (nom: string) => `${nom} a répondu à votre faire-part`,
      headerSub: 'Nouvelle réponse RSVP',
      from: 'De la part de',
      ceremony: 'Cérémonie',
      status: 'Statut',
      guests: 'Personnes',
      present: '✓ Présent(e)',
      absent: '✗ Absent(e)',
      message: 'Message',
      viewAll: 'Voir toutes les réponses',
    },
  },
  en: {
    welcome: {
      subject: "Welcome to Lov'it — Your invitation awaits!",
      headerSub: 'Welcome!',
      thanks: 'Thank you for your purchase!',
      body: 'Your digital wedding invitation is ready to be created. Click the button below to access your space and start customizing.',
      cta: 'ACCESS MY SPACE',
      ctaSub: 'This link will sign you in automatically.<br>You can then set a password to easily sign in from any device.',
      passwordLink: 'Set your password directly',
      footer: "With love,<br>The Lov'it Team",
    },
    promo: {
      subject: "Welcome to Lov'it — Your access is activated!",
      headerSub: 'Access activated!',
      body: 'Your promo code has been validated. Your digital wedding invitation is ready to be created.',
      passwordBody: 'To access your space from any device, set your password:',
      passwordCta: 'Set your password',
      magicSub: 'You can also sign in directly with this magic link:',
      magicLink: 'Sign in without password',
    },
    magicLink: {
      subject: "Your Lov'it sign-in link",
      headerSub: 'Sign-in link',
      body: 'Click the button below to sign in to your Lov\'it space. This link is valid for 15 minutes.',
      cta: 'Sign in',
      ignore: 'If you did not request this link, please ignore this email.',
    },
    rsvp: {
      subject: (nom: string) => `${nom} responded to your invitation`,
      headerSub: 'New RSVP response',
      from: 'From',
      ceremony: 'Ceremony',
      status: 'Status',
      guests: 'Guests',
      present: '✓ Attending',
      absent: '✗ Not attending',
      message: 'Message',
      viewAll: 'View all responses',
    },
  },
}

export function getEmailT(locale: Locale | string | undefined) {
  return t[locale === 'en' ? 'en' : 'fr']
}

export function emailLayout(headerSub: string, body: string, locale: Locale | string | undefined) {
  const footer = locale === 'en' ? t.en.welcome.footer : t.fr.welcome.footer
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fff8ed;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#C9A84C,#e8c96a);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:300;color:white;letter-spacing:0.06em;">Lov'it</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${headerSub}</p>
    </div>
    <div style="padding:32px;">
      ${body}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f0e6d3;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">${footer}</p>
    </div>
  </div>
</body>
</html>`
}

export function emailButton(href: string, text: string) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:white;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:700;letter-spacing:0.06em;box-shadow:0 4px 16px rgba(201,168,76,0.35);">
      ${text}
    </a>
  </div>`
}

export function emailSecondaryLink(href: string, text: string) {
  return `<div style="text-align:center;">
    <a href="${href}" style="font-size:13px;color:#C9A84C;text-decoration:underline;">${text}</a>
  </div>`
}
