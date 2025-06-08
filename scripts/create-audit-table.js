const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

const createAuditTable = async () => {
  const filePath = path.join(__dirname, 'sql', 'create_audit_logs.sql');
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    console.log('Creating audit_logs table...');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('execute_sql', { 
          sql_query: statement.trim() + ';' 
        });
        
        if (error) {
          console.error('Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error details:', error);
        } else {
          console.log('✓ Executed statement successfully');
        }
      }
    }
    
    console.log('✅ Audit table setup completed!');
  } catch (error) {
    console.error('❌ Error creating audit table:', error);
  }
};

createAuditTable();
