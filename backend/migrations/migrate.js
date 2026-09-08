// Migration script untuk menambahkan kolom urutan ke virtual_tour
import db from '../src/config/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runMigration = async () => {
  try {
    console.log('🚀 Starting migration: add_urutan_to_virtual_tour');
    console.log('='.repeat(60));
    
    // Read SQL file
    const sqlPath = join(__dirname, 'add_urutan_to_virtual_tour.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute migration
    console.log('📝 Executing SQL migration...');
    await db.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    
    // Verify migration
    console.log('\n📊 Verification - Photos per location:');
    const result = await db.query(`
      SELECT 
        l.nama as lokasi_nama,
        vt.lokasi_id,
        COUNT(*) as total_photos,
        MIN(vt.urutan) as min_order,
        MAX(vt.urutan) as max_order
      FROM virtual_tour vt
      LEFT JOIN lokasi l ON vt.lokasi_id = l.id
      WHERE vt.lokasi_id IS NOT NULL
      GROUP BY l.nama, vt.lokasi_id
      ORDER BY vt.lokasi_id
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No virtual tours found with lokasi_id');
      console.log('   This is OK if you haven\'t uploaded photos yet.');
    } else {
      console.table(result.rows);
    }
    
    // Show sample photos
    console.log('\n📸 Sample photos (first 10):');
    const samples = await db.query(`
      SELECT 
        vt.id,
        vt.nama,
        l.nama as lokasi_nama,
        vt.urutan,
        vt.created_at
      FROM virtual_tour vt
      LEFT JOIN lokasi l ON vt.lokasi_id = l.id
      ORDER BY vt.lokasi_id, vt.urutan
      LIMIT 10
    `);
    
    console.table(samples.rows);
    
    console.log('\n✨ Migration successful!');
    console.log('Next steps:');
    console.log('1. Upload multiple photos with same lokasi_id');
    console.log('2. Test navigation in /virtual-tour page');
    console.log('3. Check browser console for hotspot logs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run migration
runMigration();
