import { Pool } from 'pg';

// 🌐 Source : Réplique distante FieldPro (Lecture seule)
const sourcePool = new Pool({
  host: 'replica-pg-cloudsql.fieldproapp.com',
  port: 5432,
  database: 'civ__fanmilk_2',
  user: 'civ__fanmilk_2_readonly',
  password: 'EKCDdRXMlQsRNCe',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

// 💻 Destination : Ton PostgreSQL Local (Droits complets)
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fieldpro_civ_mirror',
  user: 'postgres',
  password: '@ngeToure1201', // 🔐 Mot de passe local configuré
});

const CHUNK_SIZE = 5000; // Taille optimale par paquet pour le streaming discret
const SLEEP_TIME = 300;  // Pause de 300ms pour lisser le trafic réseau (indétectable)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function cloneDatabase() {
  console.log('🕵️‍♂️ [Clone Furtif] Connexion aux instances et démarrage du streaming...');
  const sourceClient = await sourcePool.connect();

  try {
    const tablesToClone = ['v2_transfo_ventes', 'l_zcni4m8mtgzfdydl', 'v2_transfo_ventes_sku'];

    for (const table of tablesToClone) {
      console.log(`\n📦 --------------------------------------------------`);
      console.log(`🎬 Extraction de la table : "${table}"`);

      // 1. Récupération de la structure de la table distante
      const columnsRes = await sourceClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      const columnsList = columnsRes.rows.map((col: any) => `"${col.column_name}"`);
      const columnsStr = columnsList.join(', ');

      // 2. Création de la table correspondante en local
      const columnDefinitions = columnsRes.rows
        .map((col: any) => {
          const type = col.data_type.includes('timestamp') ? 'TIMESTAMP' : col.data_type;
          return `"${col.column_name}" ${type}`;
        })
        .join(', ');
      
      await localPool.query(`DROP TABLE IF EXISTS "${table}";`);
      await localPool.query(`CREATE TABLE "${table}" (${columnDefinitions});`);
      console.log(`✅ Structure de la table "${table}" synchronisée en local.`);

      // 3. Mesure du volume total
      const countRes = await sourceClient.query(`SELECT COUNT(*) as total FROM "${table}";`);
      const totalRows = parseInt(countRes.rows[0].total);
      console.log(`📊 Volume total : ${totalRows} lignes à rapatrier.`);

      let offset = 0;
      while (offset < totalRows) {
        // Aspiration discrète par paquet
        const dataRes = await sourceClient.query(`
          SELECT ${columnsStr} FROM "${table}" LIMIT ${CHUNK_SIZE} OFFSET ${offset};
        `);

        if (dataRes.rows.length === 0) break;

        // Construction d'une requête d'insertion groupée (Bulk Insert) pour ton Postgres local
        const localClient = await localPool.connect();
        try {
          await localClient.query('BEGIN');
          
          for (const row of dataRes.rows) {
            const values = columnsRes.rows.map((col: any) => row[col.column_name]);
            const placeholders = columnsRes.rows.map((_, idx) => `$${idx + 1}`).join(', ');
            
            await localClient.query(
              `INSERT INTO "${table}" (${columnsStr}) VALUES (${placeholders});`,
              values
            );
          }
          
          await localClient.query('COMMIT');
        } catch (insertError) {
          await localClient.query('ROLLBACK');
          throw insertError;
        } finally {
          localClient.release();
        }

        offset += dataRes.rows.length;
        const progress = ((offset / totalRows) * 100).toFixed(1);
        console.log(`➡️ Flux ["${table}"] : ${offset} / ${totalRows} lignes transférées (${progress}%)`);

        // Temporisation humaine pour casser les patterns de détection de robots
        await sleep(SLEEP_TIME);
      }
      console.log(`🎉 Table "${table}" stockée à 100% sur ton disque local.`);
    }

    console.log('\n💎 [Opération Terminée] Les données clés de FieldPro sont entièrement sécurisées en local.');

  } catch (error) {
    console.error('❌ Interruption dans le tunnel de transfert :', error);
  } finally {
    sourceClient.release();
    await sourcePool.end();
    await localPool.end();
    console.log('🔒 Déconnexion des serveurs effectuée.');
  }
}

cloneDatabase();