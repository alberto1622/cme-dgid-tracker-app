import * as XLSX from 'xlsx';

interface EntityData {
  id: number;
  ninea: string | null;
  denomination: string | null;
  type: string | null;
  formeJuridique: string | null;
  adresse: string | null;
  region: string | null;
  centreFiscal: string | null;
  activite: string | null;
  secteurActivite: string | null;
  regimeFiscal: string | null;
  nombreParcelles: number | null;
  presentCME: boolean | null;
  presentANSD: boolean | null;
  presentSIGTAS: boolean | null;
  presentSVLMOD: boolean | null;
  presentScraper: boolean | null;
}

interface PropertyData {
  id: number;
  nicad: string | null;
  adresse: string | null;
  commune: string | null;
  superficie: number | null;
  valeurLocative: number | null;
  typeBien: string | null;
  usage: string | null;
}

// Export des entités vers Excel
export function exportEntitiesToExcel(entities: EntityData[], filename: string = 'entites-cme-dgid') {
  const data = entities.map(entity => ({
    'ID': entity.id,
    'NINEA': entity.ninea || '',
    'Dénomination': entity.denomination || '',
    'Type': entity.type || '',
    'Forme Juridique': entity.formeJuridique || '',
    'Adresse': entity.adresse || '',
    'Région': entity.region || '',
    'Centre Fiscal': entity.centreFiscal || '',
    'Activité': entity.activite || '',
    'Secteur': entity.secteurActivite || '',
    'Régime Fiscal': entity.regimeFiscal || '',
    'Nb Parcelles': entity.nombreParcelles || 0,
    'CME': entity.presentCME ? 'Oui' : 'Non',
    'ANSD': entity.presentANSD ? 'Oui' : 'Non',
    'SIGTAS': entity.presentSIGTAS ? 'Oui' : 'Non',
    'SVLMOD': entity.presentSVLMOD ? 'Oui' : 'Non',
    'Scraper': entity.presentScraper ? 'Oui' : 'Non',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 6 },   // ID
    { wch: 15 },  // NINEA
    { wch: 40 },  // Dénomination
    { wch: 12 },  // Type
    { wch: 20 },  // Forme Juridique
    { wch: 50 },  // Adresse
    { wch: 15 },  // Région
    { wch: 15 },  // Centre Fiscal
    { wch: 20 },  // Activité
    { wch: 15 },  // Secteur
    { wch: 20 },  // Régime Fiscal
    { wch: 12 },  // Nb Parcelles
    { wch: 6 },   // CME
    { wch: 6 },   // ANSD
    { wch: 8 },   // SIGTAS
    { wch: 8 },   // SVLMOD
    { wch: 8 },   // Scraper
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Entités');

  // Générer et télécharger le fichier
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
}

// Export de l'inventaire des biens vers Excel
export function exportInventoryToExcel(
  entity: { denomination: string | null; ninea: string | null },
  properties: PropertyData[],
  filename: string = 'inventaire-biens'
) {
  const data = properties.map(prop => ({
    'NICAD': prop.nicad || '',
    'Adresse': prop.adresse || '',
    'Commune': prop.commune || '',
    'Superficie (m²)': prop.superficie || 0,
    'Valeur Locative (FCFA)': prop.valeurLocative || 0,
    'Type de Bien': prop.typeBien || '',
    'Usage': prop.usage || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 20 },  // NICAD
    { wch: 50 },  // Adresse
    { wch: 20 },  // Commune
    { wch: 15 },  // Superficie
    { wch: 20 },  // Valeur Locative
    { wch: 15 },  // Type de Bien
    { wch: 15 },  // Usage
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  
  // Ajouter une feuille d'information sur l'entité
  const infoData = [
    { 'Information': 'Dénomination', 'Valeur': entity.denomination || '' },
    { 'Information': 'NINEA', 'Valeur': entity.ninea || '' },
    { 'Information': 'Nombre de biens', 'Valeur': properties.length.toString() },
    { 'Information': 'Date export', 'Valeur': new Date().toLocaleDateString('fr-FR') },
  ];
  const infoSheet = XLSX.utils.json_to_sheet(infoData);
  infoSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
  
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informations');
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Biens Immobiliers');

  // Générer et télécharger le fichier
  const date = new Date().toISOString().split('T')[0];
  const safeName = (entity.denomination || 'entite').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  XLSX.writeFile(workbook, `${filename}_${safeName}_${date}.xlsx`);
}

// Export des statistiques vers Excel
export function exportStatsToExcel(stats: Record<string, unknown>[], sheetName: string, filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(stats);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
}
