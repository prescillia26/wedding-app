/**
 * Test léger du générateur HTML — pas besoin de Next.js
 * Usage : npx tsx scripts/test-generate.ts
 */

import { generateStaticHtml, type GenerateInput } from '../lib/refonte/generate-html'
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

const testData: GenerateInput = {
  marie1Prenom: 'Sarah',
  marie1Nom: 'Cohen',
  marie2Prenom: 'David',
  marie2Nom: 'Levy',
  mariageJuif: true,

  famille1: {
    pere: { prenom: 'Marc', nom: 'Cohen', disparu: false },
    mere: { prenom: 'Rachel', nom: 'Cohen', disparu: false },
    grandParentsPaternels: {
      grandPerePrenom: 'Henri', grandPereNom: 'Cohen', grandPereDisparu: true,
      grandMerePrenom: 'Suzanne', grandMereNom: 'Cohen', grandMereDisparu: false,
    },
    grandParentsMaternels: {
      grandPerePrenom: 'Albert', grandPereNom: 'Bensimon', grandPereDisparu: false,
      grandMerePrenom: 'Mireille', grandMereNom: 'Bensimon', grandMereDisparu: false,
    },
  },

  famille2: {
    pere: { prenom: 'Simon', nom: 'Levy', disparu: false },
    mere: { prenom: 'Esther', nom: 'Levy', disparu: false },
    grandParentsPaternels: {
      grandPerePrenom: 'Jacques', grandPereNom: 'Levy', grandPereDisparu: true,
      grandMerePrenom: 'Germaine', grandMereNom: 'Levy', grandMereDisparu: true,
    },
    grandParentsMaternels: {
      grandPerePrenom: 'Maurice', grandPereNom: 'Toledano', grandPereDisparu: false,
      grandMerePrenom: 'Odette', grandMereNom: 'Toledano', grandMereDisparu: false,
    },
  },

  evenements: [
    {
      id: 'evt-1',
      type: 'Mairie',
      customName: '',
      lieu: 'Mairie du 16e',
      adresse: '71 avenue Henri Martin, 75016 Paris',
      date: '2027-06-15',
      heure: '15:00',
      note: '',
      transport: '',
      hebergement: '',
      suiviDAutre: true,
      evenementSuivantNom: 'la Houppa',
      evenementSuivantAdresse: 'Synagogue de la Victoire, 44 rue de la Victoire, 75009 Paris',
    },
    {
      id: 'evt-2',
      type: 'Henné',
      customName: '',
      lieu: 'Salle des Fêtes Le Royal',
      adresse: '12 rue du Temple, 75004 Paris',
      date: '2027-06-14',
      heure: '20:00',
      note: 'Tenue traditionnelle appréciée',
      transport: '',
      hebergement: '',
    },
    {
      id: 'evt-3',
      type: 'Cérémonie religieuse / Houppa',
      customName: '',
      lieu: 'Synagogue de la Victoire',
      adresse: '44 rue de la Victoire, 75009 Paris',
      date: '2027-06-15',
      heure: '17:00',
      note: 'Merci de prévoir une tenue de cérémonie',
      transport: 'Métro Notre-Dame-de-Lorette (ligne 12)',
      hebergement: 'Hôtel Raphael — tarif préférentiel code COHENLEVY',
    },
  ],

  paletteId: 'ivoire-dore',
  logoUrl: '',
  musicUrl: '',
  images: {},
  emailContact: 'test@example.com',
}

console.log('Génération du HTML...')
const html = generateStaticHtml(testData)

const outPath = resolve(__dirname, '../test-output.html')
writeFileSync(outPath, html, 'utf-8')
console.log(`Fichier généré : ${outPath} (${(html.length / 1024).toFixed(0)} Ko)`)

execSync(`open "${outPath}"`)
console.log('Ouvert dans le navigateur.')
