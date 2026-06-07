// Bibliothèque de 58 visuels aquarelles curatés pour le Pack Luxe

export type VisualCategory = 'couples' | 'mairie' | 'houppa' | 'shabbat' | 'beach' | 'rsvp' | 'delimiter' | 'itineraire'

export interface Visual {
  id: string
  category: VisualCategory
  label: string
  url: string
}

export const VISUALS: Visual[] = [
  // ── Couples (20) ──────────────────────────────────────────────────────
  { id: 'C01', category: 'couples', label: 'Couple 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498221/3_rmpru1.png' },
  { id: 'C02', category: 'couples', label: 'Couple 2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498222/2_zc0gkx.png' },
  { id: 'C03', category: 'couples', label: 'Couple 3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498223/4_xp4bhz.png' },
  { id: 'C04', category: 'couples', label: 'Couple 4', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498224/7_wqweoi.png' },
  { id: 'C05', category: 'couples', label: 'Couple 5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498225/6_umde0p.png' },
  { id: 'C06', category: 'couples', label: 'Couple 6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498226/5_wji7ri.png' },
  { id: 'C07', category: 'couples', label: 'Couple 7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498228/10_o59llq.png' },
  { id: 'C08', category: 'couples', label: 'Couple 8', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498230/13_vtlmbu.png' },
  { id: 'C09', category: 'couples', label: 'Couple 9', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498230/11_foyfhl.png' },
  { id: 'C10', category: 'couples', label: 'Couple 10', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498230/12_t2npvt.png' },
  { id: 'C11', category: 'couples', label: 'Couple 11', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498230/8_bej1iw.png' },
  { id: 'C12', category: 'couples', label: 'Couple 12', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498267/15_cg2vsi.png' },
  { id: 'C13', category: 'couples', label: 'Couple 13', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498266/14_elpvyl.png' },
  { id: 'C14', category: 'couples', label: 'Couple 14', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498272/21_uq53kw.png' },
  { id: 'C15', category: 'couples', label: 'Couple 15', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498271/20_fsei03.png' },
  { id: 'C16', category: 'couples', label: 'Couple 16', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498279/24_yh2poc.png' },
  { id: 'C17', category: 'couples', label: 'Couple 17', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498283/34_wnjgyc.png' },
  { id: 'C18', category: 'couples', label: 'Couple 18', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498287/38_usomhj.png' },
  { id: 'C19', category: 'couples', label: 'Couple 19', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498289/43_xziory.png' },
  { id: 'C20', category: 'couples', label: 'Couple 20', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498299/56_wny8tt.png' },

  // ── Mairie (14) ───────────────────────────────────────────────────────
  { id: 'M01', category: 'mairie', label: 'Mairie 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780178453/watercolors/st6oedinlfobqf1tqgkk.png' },
  { id: 'M02', category: 'mairie', label: 'Mairie 2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780072970/watercolors/ctscnr74tgg6j2dxbh7n.png' },
  { id: 'M03', category: 'mairie', label: 'Mairie 3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780180832/watercolors/twedcawmatgadftm9zbw.png' },
  { id: 'M04', category: 'mairie', label: 'Mairie 4', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498267/16_z7rwsn.png' },
  { id: 'M05', category: 'mairie', label: 'Mairie 5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498269/19_uszmbo.png' },
  { id: 'M06', category: 'mairie', label: 'Mairie 6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498275/26_jhzvoj.png' },
  { id: 'M07', category: 'mairie', label: 'Mairie 7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498279/25_sjfazj.png' },
  { id: 'M08', category: 'mairie', label: 'Mairie 8', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498287/33_ue54fg.png' },
  { id: 'M09', category: 'mairie', label: 'Mairie 9', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498289/48_fsefsm.png' },
  { id: 'M10', category: 'mairie', label: 'Mairie 10', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498291/47_hdipe1.png' },
  { id: 'M11', category: 'mairie', label: 'Mairie 11', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498291/44_l0hoo1.png' },
  { id: 'M12', category: 'mairie', label: 'Mairie 12', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498299/57_trnqcw.png' },
  { id: 'M13', category: 'mairie', label: 'Mairie 13', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498301/58_u8a5ma.png' },
  { id: 'M14', category: 'mairie', label: 'Mairie 14', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498303/60_i5rwnj.png' },
  { id: 'M15', category: 'mairie', label: 'Mairie 15', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780683058/101_vsahmu.png' },

  // ── Houppa (10) ───────────────────────────────────────────────────────
  { id: 'HU01', category: 'houppa', label: 'Houppa 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498306/65_t8zu3e.png' },
  { id: 'HU02', category: 'houppa', label: 'Houppa 2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498304/64_sd1ulu.png' },
  { id: 'HU03', category: 'houppa', label: 'Houppa 3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498304/66_svg16d.png' },
  { id: 'HU04', category: 'houppa', label: 'Houppa 4', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498304/62_lshcgv.png' },
  { id: 'HU05', category: 'houppa', label: 'Houppa 5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498302/63_trpvtt.png' },
  { id: 'HU06', category: 'houppa', label: 'Houppa 6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498278/29_bt0ngb.png' },
  { id: 'HU07', category: 'houppa', label: 'Houppa 7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498277/27_mqj2pi.png' },
  { id: 'HU08', category: 'houppa', label: 'Houppa 8', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780213054/watercolors/zlfwhcqfmsmpcvkgaxs4.png' },
  { id: 'HU09', category: 'houppa', label: 'Houppa 9', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780178389/watercolors/pvgyg06aka8rnn6c2gok.png' },
  { id: 'HU10', category: 'houppa', label: 'Houppa 10', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780077676/watercolors/xmlalwrz5n43txcdxknw.png' },
  { id: 'HU11', category: 'houppa', label: 'Houppa 11', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780683025/98_szms5i.png' },

  // ── Shabbat (12) ──────────────────────────────────────────────────────
  { id: 'S01', category: 'shabbat', label: 'Shabbat 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498308/69_okdgu1.png' },
  { id: 'S02', category: 'shabbat', label: 'Shabbat 2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498308/70_vtlejt.png' },
  { id: 'S03', category: 'shabbat', label: 'Shabbat 3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498308/72_cwwlo1.png' },
  { id: 'S04', category: 'shabbat', label: 'Shabbat 4', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498309/73_usf5mn.png' },
  { id: 'S05', category: 'shabbat', label: 'Shabbat 5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498309/74_ueoane.png' },
  { id: 'S06', category: 'shabbat', label: 'Shabbat 6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498310/76_exvmzt.png' },
  { id: 'S07', category: 'shabbat', label: 'Shabbat 7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498305/68_feq3lk.png' },
  { id: 'S08', category: 'shabbat', label: 'Shabbat 8', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498310/71_sfjkcz.png' },
  { id: 'S09', category: 'shabbat', label: 'Shabbat 9', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498312/77_orks30.png' },
  { id: 'S10', category: 'shabbat', label: 'Shabbat 10', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498305/67_hriahx.png' },
  { id: 'S11', category: 'shabbat', label: 'Shabbat 11', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780077778/watercolors/b2gmx19v0tvjldk7vpeo.png' },
  { id: 'S12', category: 'shabbat', label: 'Shabbat 12', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780078866/watercolors/iwcbnp8rtdxfro8uifu3.png' },

  // ── Délimiteurs (2) ───────────────────────────────────────────────────
  { id: 'D11', category: 'delimiter', label: 'Colombes', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479346/delimiters/delimiters/d11-doves.png' },
  { id: 'D14', category: 'delimiter', label: 'Bougies', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780479348/delimiters/delimiters/d14-candles.png' },

  // ── Beach Party (3) ──────────────────────────────────────────────────
  { id: 'B01', category: 'beach', label: 'Beach 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780683013/95_jtm2sc.png' },
  { id: 'B02', category: 'beach', label: 'Beach 2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780683015/96_y6mfxr.png' },
  { id: 'B03', category: 'beach', label: 'Beach 3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780683015/97_rwhyhk.png' },

  // ── Itinéraire (1) ──────────────────────────────────────────────────
  { id: 'IT01', category: 'itineraire', label: 'Itinéraire 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780683042/99_yvojqy.png' },

  // ── RSVP (9) ─────────────────────────────────────────────────────────
  { id: 'R01', category: 'rsvp', label: 'RSVP 1', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679794/87_k4isjc.png' },
  { id: 'R02', category: 'rsvp', label: 'RSVP 2', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679796/86_owvqqb.png' },
  { id: 'R03', category: 'rsvp', label: 'RSVP 3', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679801/88_l3pukk.png' },
  { id: 'R04', category: 'rsvp', label: 'RSVP 4', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679813/90_aicvrs.png' },
  { id: 'R05', category: 'rsvp', label: 'RSVP 5', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679819/91_dvzxei.png' },
  { id: 'R06', category: 'rsvp', label: 'RSVP 6', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679836/89_ms4ox1.png' },
  { id: 'R07', category: 'rsvp', label: 'RSVP 7', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679848/92_slsvpe.png' },
  { id: 'R08', category: 'rsvp', label: 'RSVP 8', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679848/93_kyhcqx.png' },
  { id: 'R09', category: 'rsvp', label: 'RSVP 9', url: 'https://res.cloudinary.com/dau96mui2/image/upload/v1780679849/94_aogybr.png' },
]

export function byCategory(category: VisualCategory): Visual[] {
  return VISUALS.filter(v => v.category === category)
}

export function byId(id: string): Visual | undefined {
  return VISUALS.find(v => v.id === id)
}

export function defaultForCategory(category: VisualCategory): Visual | undefined {
  return VISUALS.find(v => v.category === category)
}
