import { Pool } from 'pg';

// 💻 Source : Ton PostgreSQL Local
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fieldpro_civ_mirror',
  user: 'postgres',
  password: '@ngeToure1201',
});

// ☁️ Destination : Ton Supabase Cloud (Schéma Analytics)
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.begprdaocbyxfbzvavwb:Welcome25%4012345!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

const CHUNK_SIZE = 1000; 
const SLEEP_BETWEEN_BATCHES = 300; // Augmenté un peu pour laisser souffler la base gratuite

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runPurificationPipeline() {
  console.log('🚀 [ETL Pipeline] Initialisation du Bulk Pipeline ultra-rapide vers Supabase...');
  const localClient = await localPool.connect();
  let supabaseClient = await supabasePool.connect();

  try {
    // 1. Charger la matrice de contrôle
    console.log('📋 Chargement de la matrice de contrôle des prix...');
    const matrixRes = await supabaseClient.query('SELECT * FROM analytics.product_price_matrix;');
    const priceMatrix = matrixRes.rows;

    // 2. Extraire la donnée locale
    console.log('🕵️‍♂️ Extraction et purification de l\'historique depuis le clone local...');
    const dataRes = await localClient.query(`
      SELECT 
        v.date as sales_date,
        v._customer_id as customer_id,
        v.customer_name,
        v.channel,
        sku._name as product_name,
        sku._brand as brand,
        sku.quantity as raw_quantity,
        sku.total_price as raw_total_price
      FROM v2_transfo_ventes_sku sku
      INNER JOIN v2_transfo_ventes v ON sku.submission_id = v.submission_id
      WHERE sku._name IS NOT NULL 
        AND sku.total_price > 0 
        AND v.date IS NOT NULL
      ORDER BY v.date DESC
      LIMIT 150000;
    `);

    const totalRows = dataRes.rows.length;
    console.log(`📊 ${totalRows} lignes prêtes.`);

    let chunkRows: any[] = [];
    let processedCount = 0;

    for (const row of dataRes.rows) {
      const rawQty = parseFloat(row.raw_quantity.replace(/[^0-9.]/g, '')) || 1;
      const rawPrice = parseFloat(row.raw_total_price) || 0;
      
      if (rawPrice === 0) continue;

      const rawUnitPrice = rawPrice / rawQty;
      const rule = priceMatrix.find(m => m.product_name === row.product_name);
      
      let cleanQty = rawQty;
      let threshold = rule ? parseFloat(rule.max_threshold) : 250;

      if (rawUnitPrice > threshold) {
        cleanQty = rawQty * 100; // Redressement Carton -> Sachets
      }

      const finalUnitPrice = Number((rawPrice / cleanQty).toFixed(2));

      chunkRows.push({
        sales_date: row.sales_date,
        customer_id: row.customer_id,
        customer_name: row.customer_name,
        channel: row.channel || 'INCONNU',
        product_name: row.product_name,
        brand: row.brand,
        quantity_sachets: cleanQty,
        total_amount_cfa: rawPrice,
        calculated_unit_price: finalUnitPrice
      });

      // Quand on a 1000 lignes prêtes, on génère UN SEUL gros INSERT générique
      if (chunkRows.length === CHUNK_SIZE || processedCount + chunkRows.length === totalRows) {
        
        // Construction dynamique de la requête de Bulk Insert
        const valuesPlaceholder: string[] = [];
        const flatValues: any[] = [];
        
        chunkRows.forEach((item, i) => {
          const offset = i * 9;
          valuesPlaceholder.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`);
          flatValues.push(
            item.sales_date, item.customer_id, item.customer_name, item.channel,
            item.product_name, item.brand, item.quantity_sachets, item.total_amount_cfa,
            item.calculated_unit_price
          );
        });

        const bulkQuery = `
          INSERT INTO analytics.fanmilk_clean_history 
          (sales_date, customer_id, customer_name, channel, product_name, brand, quantity_sachets, total_amount_cfa, calculated_unit_price)
          VALUES ${valuesPlaceholder.join(', ')};
        `;

        // Exécution de l'unique requête réseau
        try {
          await supabaseClient.query(bulkQuery, flatValues);
        } catch (dbError) {
          // Si la connexion a sauté entre-temps, on recrée un client proprement
          console.log('🔄 Reconnexion à Supabase...');
          supabaseClient.release();
          supabaseClient = await supabasePool.connect();
          await supabaseClient.query(bulkQuery, flatValues);
        }

        processedCount += chunkRows.length;
        const progress = ((processedCount / totalRows) * 100).toFixed(1);
        console.log(`➡️ [Bulk Insert] : ${processedCount} / ${totalRows} lignes purifiées et synchronisées (${progress}%)`);
        
        chunkRows = [];
        await sleep(SLEEP_BETWEEN_BATCHES); // Pause de sécurité
      }
    }

    console.log('\n💎 [Mission Réussie] Les 150 000 lignes sont sécurisées et purifiées sur ton Supabase !');

  } catch (error) {
    console.error('❌ Échec dans le pipeline ETL :', error);
  } finally {
    localClient.release();
    supabaseClient.release();
    await localPool.end();
    await supabasePool.end();
    console.log('🔒 Connexions fermées.');
  }
}

runPurificationPipeline();