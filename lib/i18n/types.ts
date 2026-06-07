export type Locale = 'fr' | 'en'

export interface CommonDict {
  siteTitle: string
  price: string
  priceBefore: string
  priceCurrency: string
  loading: string
  saving: string
  saved: string
  error: string
  back: string
  next: string
  previous: string
  generate: string
  share: string
  copy: string
  delete: string
  cancel: string
  confirm: string
  login: string
  logout: string
  logoutPending: string
  createAccount: string
  yourSpace: string
  newFairepart: string
  linkCopied: string
  satisfiedOrRefunded: string
  lifetimeAccess: string
  singlePayment: string
  startNow: string
  createYourFairepart: string
  legalNotice: string
  privacyPolicy: string
  terms: string
  contact: string
  allRightsReserved: string
  switchLang: string
}

export interface HomeDict {
  badge: string
  heroTitle1: string
  heroTitle2: string
  heroSubtitle: string
  priceBefore: string
  stats: { couples: string; time: string; rsvp: string; rating: string }
  statsLabels: { couples: string; time: string; rsvp: string; rating: string }
  howItWorks: string
  howItWorksSub: string
  steps: { title: string; desc: string }[]
  themes: string
  themesSub: string
  themeNames: { classic: string; country: string; oriental: string }
  features: string
  featuresSub: string
  featuresList: { icon: string; title: string; desc: string }[]
  testimonials: string
  testimonialsSub: string
  reviews: { name: string; city: string; text: string }[]
  pricing: string
  pricingSub: string
  pricingLabel: string
  pricingFeatures: string[]
  faq: string
  faqSub: string
  faqItems: { q: string; a: string }[]
  ctaTitle: string
  ctaSub: string
  footerTagline: string
}

export interface AuthDict {
  connectTitle: string
  email: string
  emailPlaceholder: string
  password: string
  passwordPlaceholder: string
  passwordMin: string
  passwordMismatch: string
  forgotPassword: string
  noAccount: string
  needsPasswordMsg: string
  sendMagicLink: string
  magicLinkSent: string
  sending: string
  connecting: string
  forgotTitle: string
  forgotSuccess: string
  forgotCheckSpam: string
  forgotSend: string
  forgotBack: string
  setPasswordTitle: string
  setPasswordSub: string
  setPasswordBtn: string
  setPasswordDone: string
  verifyLoading: string
  verifySuccess: string
  verifyError: string
  verifyRedirect: string
}

export interface DashboardDict {
  hello: string
  noFairepart: string
  noFairepartDesc: string
  confirmed: string
  responses: string
  edit: string
  shareBtn: string
  viewRsvp: string
  tablePlan: string
  setPassword: string
  newFairepart: string
  newFairepartPrice: string
}

export interface PaymentDict {
  title: string
  subtitle: string
  launchOffer: string
  features: string[]
  urgency: string
  urgencyCouples: string
  cta: string
  trust: { secure: string; instant: string; guarantee: string }
  futureTitle: string
  futureSub: string
  alreadyAccount: string
}

export interface SuccessDict {
  title: string
  packActive: string
  createAccountTitle: string
  createAccountSub: string
  passwordLabel: string
  confirmLabel: string
  createBtn: string
  accountCreated: string
  redirecting: string
  createFairepart: string
  goToSpace: string
  verifying: string
  errorMissing: string
  errorVerify: string
}

export interface FairepartDict {
  // Progress bar
  stepMarried: string
  stepFamilies: string
  stepCeremonies: string
  stepStyle: string
  // Step 1
  step1Title: string
  person1: string
  person2: string
  firstName: string
  lastName: string
  secondName: string
  customLink: string
  customLinkExample: string
  emailLabel: string
  emailHelp: string
  dateOverride: string
  dateOverrideHelp: string
  hebrewFirstName: string
  // Step 2
  step2Title: string
  fatherLabel: string
  motherLabel: string
  gpPaternal: string
  gpMaternal: string
  gpHelp: string
  // Placeholders
  placeholderFirstName1: string
  placeholderLastName1: string
  placeholderFirstName2: string
  placeholderLastName2: string
  placeholderGpFirstName: string
  placeholderGpLastName: string
  placeholderGmFirstName: string
  placeholderGmLastName: string
  placeholderVenue: string
  placeholderVenueName: string
  placeholderCompanion: string
  // Step 3
  step3Title: string
  ceremonyTypes: Record<string, string>
  customEventName: string
  venue: string
  address: string
  date: string
  time: string
  afterEvent: string
  afterEventName: string
  afterEventAddress: string
  transportToggle: string
  transportLabel: string
  accommodationLabel: string
  memorialToggle: string
  memorialIntro: string
  memorialNames: string
  memorialEnd: string
  memorialOptions: string[]
  addCeremony: string
  removeCeremony: string
  introPhrase: string
  // Step 4
  step4Title: string
  themeLabel: string
  presentationLabel: string
  presentationOptions: Record<string, string>
  fontLabel: string
  textColorLabel: string
  accentColorLabel: string
  monogramStyleLabel: string
  monogramStyles: Record<string, string>
  monogramColorLabel: string
  colorOptions: Record<string, string>
  jewishWedding: string
  musicLabel: string
  musicHelp: string
  youtubeLabel: string
  frameLabel: string
  ornamentLabel: string
  accueilStyleLabel: string
  accueilOptions: Record<string, string>
  illustrationLabel: string
  logoUpload: string
  logoUploading: string
  logoDelete: string
  logoHelp: string
  logoAdvanced: string
  logoSize: string
  logoColor: string
  animationLabel: string
  animationOptions: Record<string, string>
  animationTextLabel: string
  animationTextOptions: Record<string, string>
  monogramPreviewHint: string
  illustrationReplacesMonogram: string
  presentationDescriptions: Record<string, string>
  effectLabel: string
  effectOptions: Record<string, string>
  zoneStyleLabel: string
  zones: Record<string, string>
  // Buttons
  generateBtn: string
  resumeDraft: string
  savedAt: string
  savedServer: string
  savingServer: string
  sessionExpired: string
  // AccessGate
  promoTitle: string
  promoCodeLabel: string
  promoEmailLabel: string
  promoCheck: string
  promoError: string
  // Invitation view
  discoverInvitation: string
  openInvitation: string
  weddingOf: string
  pleaseJoin: string
  yourResponse: string
  rsvpBtn: string
  viewRsvpBtn: string
  // RSVP Modal
  rsvpTitle: string
  rsvpName: string
  rsvpNamePlaceholder: string
  rsvpPresent: string
  rsvpAbsent: string
  rsvpNbPersons: string
  rsvpCompanions: string
  rsvpCompanionPlaceholder: string
  rsvpMessage: string
  rsvpMessagePlaceholder: string
  rsvpSend: string
  rsvpSending: string
  rsvpSent: string
  rsvpAlreadyAnswered: string
  rsvpError: string
  // RSVP List
  rsvpListTitle: string
  rsvpTotal: string
  rsvpConfirmed: string
  rsvpPersonsPresent: string
  rsvpDownloadExcel: string
  rsvpNoResponses: string
  // Share Modal
  shareTitle: string
  shareGuestLink: string
  shareCoupleLink: string
  shareCopied: string
  // Ceremony text
  joyMessage: string
  joyMessageGp: string
  kolSasson: string
  precises: string
  // Ceremony card titles
  cardTitles: Record<string, string>
  rsvpInviteText: string
  infoPratiques: string
  transportIcon: string
  hebergementIcon: string
  inviteShareJoy: string
  // Buttons bar
  editBtn: string
  textBtn: string
  tablesBtn: string
  newBtn: string
  // Toast
  errorUploadPhoto: string
  errorUploadLogo: string
  errorFileTooLarge: string
  errorShare: string
  errorRsvp: string
  // Misc
  invitationLabel: string
  photoUploadLabel: string
  photoDeleteLabel: string
  // Family title formatting (A)
  mr: string
  mrs: string
  mrAndMrs: string
  // Invitation phrases (B)
  inviteFamilies: string
  inviteWillBeDelightedToInviteYou: string
  inviteYouAreInvitedTo: string
  inviteShabbatHatanOf: string
  inviteHenneIntro: string
  inviteHenneOf: string
  inviteHenneTradition: string
  inviteCocktailIntro: string
  inviteCocktailCelebrate: string
  inviteSoireeIntro: string
  inviteSoireeAllNight: string
  inviteBoatPartyIntro: string
  inviteBoatPartySea: string
  inviteBeachPartyIntro: string
  inviteBeachPartySea: string
  inviteAutreJoin: string
  inviteAutreFor: string
  inviteAutreDefaultEvent: string
  // Photo section (C)
  photoSectionTitle: string
  photoSectionHelp: string
  photoUploading: string
  photoClickToAdd: string
  photoCropClose: string
  photoCropBtn: string
  photoCropTitle: string
  cropDragHelp: string
  cropDezoom: string
  cropZoom: string
  cropNormal: string
  cropReset: string
  cropValidate: string
  // Music section (D)
  musicDownloadMp3: string
  musicUploaded: string
  musicDelete: string
  musicUploadInProgress: string
  musicClickToUpload: string
  musicFormatHelp: string
  musicUploadError: string
  musicNetworkError: string
  // Email section
  emailSectionTitle: string
  emailSectionHelp: string
  // RSVP confirmation (F)
  rsvpThankYou: string
  rsvpAlreadyRespondedMsg: string
  rsvpCoupleReceivedResponse: string
  rsvpClose: string
  rsvpThankYouName: string
  rsvpNotMeBtn: string
  // Share/WhatsApp section (G)
  shareReadyTitle: string
  shareOnWhatsApp: string
  shareSendOnWhatsApp: string
  sharePreWrittenMsg: string
  shareCustomizeMsg: string
  shareCopyMsg: string
  shareCopyBtn: string
  shareKeepLink: string
  // WhatsApp message template (G)
  whatsappDearFriends: string
  whatsappInviteText: string
  whatsappCelebrateText: string
  whatsappFindInvitation: string
  whatsappConfirmPresence: string
  whatsappSeeYouSoon: string
  whatsappSoon: string
  whatsappOn: string
  whatsappOnDates: string
  whatsappAnd: string
  whatsappDefaultName1: string
  whatsappDefaultName2: string
  // AccessGate error messages (H)
  accessGateFillFields: string
  accessGateNetworkError: string
  accessGateServerError: string
  accessGateGenericError: string
  accessGatePasswordMin: string
  accessGatePasswordMismatch: string
  // Session expired toast (I) - already exists as sessionExpired
  // Event note (J)
  eventNoteLabel: string
  eventNotePlaceholder: string
  eventFollowedBy: string
  afterEventPlaceholder: string
  // Memorial
  memorialCustomPlaceholder: string
  memorialAddName: string
  memorialNamePlaceholder: string
  memorialDeleteName: string
  // Transport/accommodation placeholders
  transportPlaceholder: string
  accommodationPlaceholder: string
  // Card components (E)
  cardHouppaAndSoiree: string
  cardReligiousAndSoiree: string
  cardLaHouppa: string
  cardLaMairie: string
  cardLeHenne: string
  cardShabbatHatan: string
  cardSeDiront: string
  cardOui: string
  cardFollowedByReception: string
  cardHonore: string
  cardHenneInvite: string
  cardAutreJoin: string
  cardAutreFor: string
  cardAutreDefaultEvent: string
  cardMairieFollowedBy: string
  cardItineraire: string
  cardCreatedWith: string
  // ZONE_LABELS / FONT / COLOR - already have zones dict
  // Ornament
  ornamentNone: string
  // TextEditModal labels
  textEditTitle: string
  textEditJoyLabel: string
  textEditJoyPlaceholder: string
  textEditHonoreLabel: string
  textEditHonorePlaceholder: string
  textEditInvitationLabel: string
  textEditInvitationHelp: string
  textEditLieuLabel: string
  textEditTitreLabel: string
  // Zone style labels
  zoneFont: string
  zoneFontDefault: string
  zoneColor: string
  zoneSize: string
  zoneSizeSmall: string
  zoneSizeNormal: string
  zoneSizeLarge: string
  zoneBold: string
  zoneItalic: string
  // TextEdit tabs
  textEditTabText: string
  textEditTabStyle: string
  textEditApply: string
  textEditStyleSub: string
}

export interface PlanTableDict {
  title: string
  subtitle: string
  guests: string
  tables: string
  unassigned: string
  addTable: string
  shareGuests: string
  save: string
  saving: string
  savedOk: string
  allPlaced: string
  dragHere: string
  tableFull: string
  max: string
  rename: string
  autoBtn: string
  nbTables: string
  placesPerTable: string
  generateBtn: string
  tableNames: string
  sufficient: string
  missing: string
  guestViewTitle: string
  guestViewSub: string
  notAvailable: string
  // Theme names
  themeFlowers: string
  themeCities: string
  themeTravel: string
  themeGems: string
  themeMusic: string
  themeStars: string
}

export interface Dictionary {
  common: CommonDict
  home: HomeDict
  auth: AuthDict
  dashboard: DashboardDict
  payment: PaymentDict
  success: SuccessDict
  fairepart: FairepartDict
  planTable: PlanTableDict
}
